using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Models;

namespace backend.Converters;

public class PriorityJsonConverter : JsonConverter<Priority>
{
    public override Priority Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        return value switch
        {
            "LOW" => Priority.Low,
            "MEDIUM" => Priority.Medium,
            "HIGH" => Priority.High,
            _ => throw new JsonException($"Unknown priority value: {value}")
        };
    }

    public override void Write(Utf8JsonWriter writer, Priority value, JsonSerializerOptions options)
    {
        var stringValue = value switch
        {
            Priority.Low => "LOW",
            Priority.Medium => "MEDIUM",
            Priority.High => "HIGH",
            _ => throw new JsonException($"Unknown priority value: {value}")
        };
        writer.WriteStringValue(stringValue);
    }
}