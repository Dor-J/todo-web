using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;

namespace backend.Data;

public static class CosmosInitializer
{
    public static async Task EnsureCreatedAsync(
        CosmosClient client,
        CosmosOptions options)
    {
        var dbResponse = await client.CreateDatabaseIfNotExistsAsync(options.DatabaseId);

        await dbResponse.Database.CreateContainerIfNotExistsAsync(
            new ContainerProperties
            {
                Id = options.ContainerId,
                PartitionKeyPath = options.PartitionKeyPath
            });
    }
}
