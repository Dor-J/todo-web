using System.ComponentModel.DataAnnotations;
using System.Threading.RateLimiting;
using backend.Data;
using backend.Dtos;
using backend.Middleware;
using backend.Models;
using backend.Services;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using Serilog;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
  .ReadFrom.Configuration(new ConfigurationBuilder()
    .AddJsonFile("appsettings.json")
    .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
    .AddEnvironmentVariables()
    .Build())
  .CreateLogger();

try
{
  Log.Information("Starting web application");

  var builder = WebApplication.CreateBuilder(args);

  // Use Serilog for logging
  builder.Host.UseSerilog();

  // Bind Cosmos configuration
  builder.Services.Configure<CosmosOptions>(
    builder.Configuration.GetSection("Cosmos"));

  // Bind rate limiting configuration
  var rateLimitOptions = builder.Configuration.GetSection("RateLimiting");
  var permitLimit = rateLimitOptions.GetValue<int>("PermitLimit", 100);
  var window = TimeSpan.Parse(rateLimitOptions.GetValue<string>("Window") ?? "00:01:00");
  var queueLimit = rateLimitOptions.GetValue<int>("QueueLimit", 10);

  // Configure rate limiting
  builder.Services.AddRateLimiter(options =>
  {
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
      RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
          PermitLimit = permitLimit,
          Window = window,
          QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
          QueueLimit = queueLimit
        }));

    options.OnRejected = async (context, cancellationToken) =>
    {
      context.HttpContext.Response.StatusCode = 429;
      await context.HttpContext.Response.WriteAsync(
        "Rate limit exceeded. Please try again later.",
        cancellationToken);
    };
  });

  // CosmosClient as singleton (expensive, thread-safe)
  builder.Services.AddSingleton<CosmosClient>(sp =>
  {
    var options = sp.GetRequiredService<IOptions<CosmosOptions>>().Value;
    return new CosmosClient(options.ConnectionString);
  });

  // Sanitization service
  builder.Services.AddSingleton<IHtmlSanitizerService, HtmlSanitizerService>();

  // Security monitoring service
  builder.Services.AddSingleton<ISecurityMonitoringService, SecurityMonitoringService>();

  // Repository
  builder.Services.AddSingleton<ITodoRepository, CosmosTodoRepository>();

  // Controllers / Health checks
  builder.Services.AddControllers()
    .AddNewtonsoftJson();
  builder.Services.AddHealthChecks();

  // Swagger / OpenAPI
  builder.Services.AddEndpointsApiExplorer();
  builder.Services.AddSwaggerGen();

  const string FrontendCorsPolicy = "AllowFrontend";
  builder.Services.AddCors(options =>
  {
    options.AddPolicy(
      FrontendCorsPolicy,
      policy =>
      {
        var allowedOrigins = builder.Configuration
          .GetSection("Cors:AllowedOrigins")
          .Get<string[]>();

        if (allowedOrigins is { Length: > 0 })
        {
          policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
        }
        else
        {
          policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
      });
  });

  var app = builder.Build();

  // Initialize Cosmos DB (db + container)
  using (var scope = app.Services.CreateScope())
  {
    var services = scope.ServiceProvider;
    var cosmosOptions = services.GetRequiredService<IOptions<CosmosOptions>>().Value;
    var client = services.GetRequiredService<CosmosClient>();

    try
    {
      Log.Information("Initializing Cosmos DB...");
      using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
      await CosmosInitializer.EnsureCreatedAsync(client, cosmosOptions);
      Log.Information("Cosmos DB initialized successfully");
    }
    catch (Exception ex)
    {
      Log.Fatal(ex, "Failed to initialize Cosmos DB. Check your connection string in appsettings.Development.json");
      throw;
    }
  }

  // Security middleware (should be early in pipeline)
  app.UseMiddleware<SecurityHeadersMiddleware>();
  app.UseMiddleware<RequestLoggingMiddleware>();

  // Rate limiting (before other middleware)
  app.UseRateLimiter();

  // Middleware
  if (app.Environment.IsDevelopment())
  {
    app.UseSwagger();
    app.UseSwaggerUI();
  }

  app.UseHttpsRedirection();

  app.UseCors(FrontendCorsPolicy);

  app.MapControllers();

  // --------------------------------------
  // REST API endpoints for /todos
  // --------------------------------------

  // 1. GET /todos
  app.MapGet("/todos", async (
    ITodoRepository repo,
    ISecurityMonitoringService securityMonitoring,
    HttpContext context) =>
  {
    var clientIp = context.Connection.RemoteIpAddress?.ToString();
    
    if (securityMonitoring.ShouldBlockIp(clientIp))
    {
      return Results.StatusCode(429);
    }

    var todos = await repo.GetAllAsync();
    return Results.Ok(todos);
  });

  // 2. GET /todos/{id}
  app.MapGet("/todos/{id}", async (
    string id,
    ITodoRepository repo,
    ISecurityMonitoringService securityMonitoring,
    HttpContext context) =>
  {
    var clientIp = context.Connection.RemoteIpAddress?.ToString();
    
    if (securityMonitoring.ShouldBlockIp(clientIp))
    {
      return Results.StatusCode(429);
    }

    if (!Guid.TryParse(id, out _))
    {
      securityMonitoring.RecordValidationFailure("/todos/{id}", "Invalid GUID format", clientIp);
      return Results.BadRequest(new { error = "Invalid ID format. ID must be a valid GUID." });
    }

    var todo = await repo.GetByIdAsync(id);
    return todo is null ? Results.NotFound() : Results.Ok(todo);
  });

  // 3. POST /todos
  app.MapPost("/todos", async (
    TodoCreateDto dto,
    ITodoRepository repo,
    IHtmlSanitizerService sanitizer,
    ISecurityMonitoringService securityMonitoring,
    HttpContext context) =>
  {
    var clientIp = context.Connection.RemoteIpAddress?.ToString();
    
    if (securityMonitoring.ShouldBlockIp(clientIp))
    {
      return Results.StatusCode(429);
    }

    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(dto);
    
    if (!Validator.TryValidateObject(dto, validationContext, validationResults, true))
    {
      var errors = validationResults.Select(vr => new
      {
        field = vr.MemberNames.FirstOrDefault(),
        message = vr.ErrorMessage
      }).ToList();
      
      securityMonitoring.RecordValidationFailure(
        "/todos",
        $"Validation failed: {string.Join(", ", errors.Select(e => $"{e.field}: {e.message}"))}",
        clientIp);
      
      return Results.BadRequest(new { errors });
    }

    // Sanitize input
    dto.Title = sanitizer.Sanitize(dto.Title) ?? string.Empty;
    dto.Description = sanitizer.Sanitize(dto.Description);

    var created = await repo.CreateAsync(dto);
    return Results.Created($"/todos/{created.Id}", created);
  });

  // 4. PUT /todos/{id}
  app.MapPut("/todos/{id}", async (
    string id,
    TodoUpdateDto dto,
    ITodoRepository repo,
    IHtmlSanitizerService sanitizer,
    ISecurityMonitoringService securityMonitoring,
    HttpContext context) =>
  {
    var clientIp = context.Connection.RemoteIpAddress?.ToString();
    
    if (securityMonitoring.ShouldBlockIp(clientIp))
    {
      return Results.StatusCode(429);
    }

    if (!Guid.TryParse(id, out _))
    {
      securityMonitoring.RecordValidationFailure("/todos/{id}", "Invalid GUID format", clientIp);
      return Results.BadRequest(new { error = "Invalid ID format. ID must be a valid GUID." });
    }

    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(dto);
    
    if (!Validator.TryValidateObject(dto, validationContext, validationResults, true))
    {
      var errors = validationResults.Select(vr => new
      {
        field = vr.MemberNames.FirstOrDefault(),
        message = vr.ErrorMessage
      }).ToList();
      
      securityMonitoring.RecordValidationFailure(
        "/todos/{id}",
        $"Validation failed: {string.Join(", ", errors.Select(e => $"{e.field}: {e.message}"))}",
        clientIp);
      
      return Results.BadRequest(new { errors });
    }

    // Sanitize input
    dto.Title = sanitizer.Sanitize(dto.Title) ?? string.Empty;
    dto.Description = sanitizer.Sanitize(dto.Description);

    var updated = await repo.UpdateAsync(id, dto);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
  });

  // 5. DELETE /todos/{id}
  app.MapDelete("/todos/{id}", async (
    string id,
    ITodoRepository repo,
    ISecurityMonitoringService securityMonitoring,
    HttpContext context) =>
  {
    var clientIp = context.Connection.RemoteIpAddress?.ToString();
    
    if (securityMonitoring.ShouldBlockIp(clientIp))
    {
      return Results.StatusCode(429);
    }

    if (!Guid.TryParse(id, out _))
    {
      securityMonitoring.RecordValidationFailure("/todos/{id}", "Invalid GUID format", clientIp);
      return Results.BadRequest(new { error = "Invalid ID format. ID must be a valid GUID." });
    }

    var deleted = await repo.DeleteAsync(id);
    return deleted ? Results.NoContent() : Results.NotFound();
  });

  // Global exception handler
  app.UseExceptionHandler(exceptionHandlerApp =>
  {
    exceptionHandlerApp.Run(async context =>
    {
      context.Response.StatusCode = 500;
      context.Response.ContentType = "application/json";

      var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
      var exception = exceptionHandlerPathFeature?.Error;

      Log.Error(
        exception,
        "Unhandled exception: {Path}",
        exceptionHandlerPathFeature?.Path);

      var securityMonitoring = context.RequestServices.GetRequiredService<ISecurityMonitoringService>();
      var clientIp = context.Connection.RemoteIpAddress?.ToString();
      
      if (exception != null)
      {
        securityMonitoring.RecordSuspiciousActivity(
          $"Unhandled exception: {exception.GetType().Name}",
          clientIp);
      }

      await context.Response.WriteAsJsonAsync(new
      {
        error = "An internal server error occurred. Please try again later.",
        requestId = context.TraceIdentifier
      });
    });
  });

  Log.Information("Application configured. Starting server...");
  Log.Information("Swagger UI available at: http://localhost:5013/swagger");
  await app.RunAsync();
}
catch (Exception ex)
{
  Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
  Log.CloseAndFlush();
}
