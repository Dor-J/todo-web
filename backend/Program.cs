using System.ComponentModel.DataAnnotations;
using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Bind Cosmos configuration
builder.Services.Configure<CosmosOptions>(
    builder.Configuration.GetSection("Cosmos"));

// CosmosClient as singleton (expensive, thread-safe)
builder.Services.AddSingleton<CosmosClient>(sp =>
{
    var options = sp.GetRequiredService<IOptions<CosmosOptions>>().Value;
    return new CosmosClient(options.ConnectionString);
});

// Sanitization service
builder.Services.AddSingleton<IHtmlSanitizerService, HtmlSanitizerService>();

// Repository
builder.Services.AddSingleton<ITodoRepository, CosmosTodoRepository>();

// Controllers / Health checks
builder.Services.AddControllers();
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

    await CosmosInitializer.EnsureCreatedAsync(client, cosmosOptions);
}

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
app.MapGet("/todos", async (ITodoRepository repo) =>
{
    var todos = await repo.GetAllAsync();
    return Results.Ok(todos);
});

// 2. GET /todos/{id}
app.MapGet("/todos/{id}", async (string id, ITodoRepository repo) =>
{
    if (!Guid.TryParse(id, out _))
    {
        return Results.BadRequest(new { error = "Invalid ID format. ID must be a valid GUID." });
    }

    var todo = await repo.GetByIdAsync(id);
    return todo is null ? Results.NotFound() : Results.Ok(todo);
});

// 3. POST /todos
app.MapPost("/todos", async (TodoCreateDto dto, ITodoRepository repo) =>
{
    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(dto);
    
    if (!Validator.TryValidateObject(dto, validationContext, validationResults, true))
    {
        var errors = validationResults.Select(vr => new
        {
            field = vr.MemberNames.FirstOrDefault(),
            message = vr.ErrorMessage
        }).ToList();
        
        return Results.BadRequest(new { errors });
    }

    var created = await repo.CreateAsync(dto);
    return Results.Created($"/todos/{created.Id}", created);
});

// 4. PUT /todos/{id}
app.MapPut("/todos/{id}", async (string id, TodoUpdateDto dto, ITodoRepository repo) =>
{
    if (!Guid.TryParse(id, out _))
    {
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
        
        return Results.BadRequest(new { errors });
    }

    var updated = await repo.UpdateAsync(id, dto);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
});

// 5. DELETE /todos/{id}
app.MapDelete("/todos/{id}", async (string id, ITodoRepository repo) =>
{
    if (!Guid.TryParse(id, out _))
    {
        return Results.BadRequest(new { error = "Invalid ID format. ID must be a valid GUID." });
    }

    var deleted = await repo.DeleteAsync(id);
    return deleted ? Results.NoContent() : Results.NotFound();
});

await app.RunAsync();
