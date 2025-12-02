using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class TodoCreateDto
{
    [Required]
    [StringLength(120)]
    public string Title { get; set; } = default!;

    public bool IsCompleted { get; set; } = false;

    [StringLength(1000)]
    public string? Description { get; set; }
}
