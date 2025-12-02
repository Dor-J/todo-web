using backend.Dtos;
using backend.Models;

namespace backend.Data;

public interface ITodoRepository
{
    Task<IEnumerable<TodoItem>> GetAllAsync();
    Task<TodoItem?> GetByIdAsync(string id);
    Task<TodoItem> CreateAsync(TodoCreateDto dto);
    Task<TodoItem?> UpdateAsync(string id, TodoUpdateDto dto);
    Task<bool> DeleteAsync(string id);
}
