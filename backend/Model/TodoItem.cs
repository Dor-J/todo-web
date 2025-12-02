using System.Text.Json.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace backend.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
[Newtonsoft.Json.JsonConverter(typeof(StringEnumConverter))]
public enum Priority
{
    [System.Text.Json.Serialization.JsonPropertyName("LOW")]
    [Newtonsoft.Json.JsonProperty("LOW")]
    Low,
    [System.Text.Json.Serialization.JsonPropertyName("MEDIUM")]
    [Newtonsoft.Json.JsonProperty("MEDIUM")]
    Medium,
    [System.Text.Json.Serialization.JsonPropertyName("HIGH")]
    [Newtonsoft.Json.JsonProperty("HIGH")]
    High
}

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

    public Priority Priority { get; set; } = Priority.Medium;
    public bool Starred { get; set; } = false;
}
