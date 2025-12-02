namespace backend.Data;

public class CosmosOptions
{
    public string ConnectionString { get; set; } = default!;
    public string DatabaseId { get; set; } = "TodoDb";
    public string ContainerId { get; set; } = "Todos";
    public string PartitionKeyPath { get; set; } = "/id";
}