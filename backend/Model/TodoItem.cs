using Newtonsoft.Json;

namespace backend.Models;

public class TodoItem
{
    // Cosmos requires "id" as string
    [JsonProperty(PropertyName = "id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string Title { get; set; } = default!;
    public bool IsCompleted { get; set; }

    public DateTime CreatedAt { get; set; }

    // Added for better tracking
    public string? Description { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
