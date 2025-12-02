using System.Net;
using backend.Dtos;
using backend.Models;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;

namespace backend.Data;

public class CosmosTodoRepository : ITodoRepository
{
    private readonly Container _container;

    public CosmosTodoRepository(CosmosClient client, IOptions<CosmosOptions> options)
    {
        var opt = options.Value;
        _container = client.GetContainer(opt.DatabaseId, opt.ContainerId);
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
            Title = dto.Title,
            IsCompleted = dto.IsCompleted,
            CreatedAt = now,
            UpdatedAt = now
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

        existing.Title = dto.Title;
        existing.IsCompleted = dto.IsCompleted;
        existing.UpdatedAt = DateTime.UtcNow;

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
