using System.Net;
using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;

namespace backend.Data;

public class CosmosTodoRepository : ITodoRepository
{
    private readonly Container _container;
    private readonly IHtmlSanitizerService _sanitizer;

    public CosmosTodoRepository(
        CosmosClient client,
        IOptions<CosmosOptions> options,
        IHtmlSanitizerService sanitizer)
    {
        var opt = options.Value;
        _container = client.GetContainer(opt.DatabaseId, opt.ContainerId);
        _sanitizer = sanitizer;
    }

    public async Task<IEnumerable<TodoItem>> GetAllAsync()
    {
        var query = _container.GetItemQueryIterator<TodoItem>(
            new QueryDefinition("SELECT * FROM c"));

        var results = new List<TodoItem>();

        while (query.HasMoreResults)
        {
            var response = await query.ReadNextAsync();
            results.AddRange(response);
        }

        return results;
    }

    public async Task<TodoItem?> GetByIdAsync(string id)
    {
        try
        {
            var response = await _container.ReadItemAsync<TodoItem>(
                id,
                new PartitionKey(id)
            );

            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task<TodoItem> CreateAsync(TodoCreateDto dto)
    {
        var now = DateTime.UtcNow;

        var todo = new TodoItem
        {
            Id = Guid.NewGuid().ToString(),
            Title = _sanitizer.Sanitize(dto.Title) ?? string.Empty,
            IsCompleted = dto.IsCompleted,
            CreatedAt = now,
            UpdatedAt = now,
            Description = _sanitizer.Sanitize(dto.Description),
            CompletedAt = dto.IsCompleted ? now : null
        };

        var response = await _container.CreateItemAsync(todo, new PartitionKey(todo.Id));
        return response.Resource;
    }

    public async Task<TodoItem?> UpdateAsync(string id, TodoUpdateDto dto)
    {
        var existing = await GetByIdAsync(id);
        if (existing is null)
        {
            return null;
        }

        existing.Title = _sanitizer.Sanitize(dto.Title) ?? string.Empty;
        existing.IsCompleted = dto.IsCompleted;
        existing.Description = _sanitizer.Sanitize(dto.Description);
        existing.UpdatedAt = DateTime.UtcNow;
        existing.CompletedAt = dto.IsCompleted
            ? existing.CompletedAt ?? DateTime.UtcNow
            : null;

        var response = await _container.ReplaceItemAsync(
            existing,
            id,
            new PartitionKey(id)
        );

        return response.Resource;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        try
        {
            await _container.DeleteItemAsync<TodoItem>(
                id,
                new PartitionKey(id)
            );

            return true;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return false;
        }
    }
}
