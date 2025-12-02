using backend.Data;
using backend.Dtos;
using backend.Models;
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

// Repository
builder.Services.AddSingleton<ITodoRepository, CosmosTodoRepository>();

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
    var todo = await repo.GetByIdAsync(id);
    return todo is null ? Results.NotFound() : Results.Ok(todo);
});

// 3. POST /todos
app.MapPost("/todos", async (TodoCreateDto dto, ITodoRepository repo) =>
{
    var created = await repo.CreateAsync(dto);
    return Results.Created($"/todos/{created.Id}", created);
});

// 4. PUT /todos/{id}
app.MapPut("/todos/{id}", async (string id, TodoUpdateDto dto, ITodoRepository repo) =>
{
    var updated = await repo.UpdateAsync(id, dto);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
});

// 5. DELETE /todos/{id}
app.MapDelete("/todos/{id}", async (string id, ITodoRepository repo) =>
{
    var deleted = await repo.DeleteAsync(id);
    return deleted ? Results.NoContent() : Results.NotFound();
});

await app.RunAsync();
