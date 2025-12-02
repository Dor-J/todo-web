namespace backend.Dtos;

public class TodoCreateDto
{
    public string Title { get; set; } = default!;
    public bool IsCompleted { get; set; } = false;
    public string? Description { get; set; }
}
