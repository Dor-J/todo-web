namespace backend.Dtos;

public class TodoUpdateDto
{
    public string Title { get; set; } = default!;
    public bool IsCompleted { get; set; }
    public string? Description { get; set; }
}
