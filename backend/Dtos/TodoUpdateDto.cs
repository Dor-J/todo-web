using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.Dtos;

public class TodoUpdateDto
{
    [Required]
    [StringLength(120)]
    public string Title { get; set; } = default!;

    public bool IsCompleted { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    public Priority? Priority { get; set; }
    public bool Starred { get; set; } = false;
}
