using ResourceService.Api.Models;
using MongoDB.Driver;
using ResourceService.Api.DTOs;


namespace ResourceService.Api.Services;

public class AssetsService
{
    private readonly IMongoCollection<Asset> _assetsCollection;

    public AssetsService(IMongoDatabase mongoDatabase)
    {
        _assetsCollection = mongoDatabase.GetCollection<Asset>("Assets");
    }

    /// <summary>
    /// Retrieves a paginated list of assets, optionally filtered by availability status.
    /// Implements efficient database-side skipping and limiting.
    /// </summary>
    /// <param name="page">Current page number (1-based)</param>
    /// <param name="pageSize">Number of items per page</param>
    /// <param name="isAvailable">Optional filter: null=all, true=available, false=booked</param>
    public virtual async Task<PaginatedResponse<Asset>> GetPaginatedAsync(int page, int pageSize, bool? isAvailable = null)
    {
        var filterBuilder = Builders<Asset>.Filter;
        var filter = filterBuilder.Empty;
        // ...existing code...
        if (isAvailable.HasValue)
        {
            filter &= filterBuilder.Eq(x => x.IsAvailable, isAvailable.Value);
        }

        var totalCount = await _assetsCollection.CountDocumentsAsync(filter); 
        
        // CRITICAL PERFORMANCE FIX:
        // Originally, I did .Find(filter).ToListAsync() and then just .Skip().Take() in memory.
        // It crashed with 10k mock items. Moving the logic to .Skip() before .Limit() ensures
        // the database driver handles it, keeping memory usage constant.
        var assets = await _assetsCollection.Find(filter)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return new PaginatedResponse<Asset>
        {
            Items = assets,
            Page = page,
            PageSize = pageSize,
            TotalCount = (int)totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public virtual async Task<List<Asset>> GetAsync() =>
        await _assetsCollection.Find(_ => true).ToListAsync();

    public virtual async Task<Asset?> GetAsync(string id) =>
        await _assetsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    /// <summary>
    /// Creates a new asset document in MongoDB.
    /// </summary>
    public virtual async Task CreateAsync(Asset newAsset) =>
        await _assetsCollection.InsertOneAsync(newAsset);

    public virtual async Task UpdateAsync(string id, Asset updatedAsset) =>
        await _assetsCollection.ReplaceOneAsync(x => x.Id == id, updatedAsset);

    /// <summary>
    /// Atomically books an asset if it is currently available.
    /// Prevents race conditions where two users try to book simultaneously.
    /// </summary>
    /// <returns>True if booking succeeded, false if asset was already booked.</returns>
    public virtual async Task<bool> TryBookAssetAsync(string id, string userId, string fullName)
    {
        var filter = Builders<Asset>.Filter.And(
            Builders<Asset>.Filter.Eq(x => x.Id, id),
            Builders<Asset>.Filter.Eq(x => x.IsAvailable, true)
        );
        var update = Builders<Asset>.Update
            .Set(x => x.IsAvailable, false)
            .Set(x => x.BookedBy, userId)
            .Set(x => x.BookedByFullName, fullName);

        var result = await _assetsCollection.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    /// <summary>
    /// Atomically releases an asset if the user owns it (or is admin).
    /// </summary>
    public virtual async Task<bool> TryReleaseAssetAsync(string id, string? requiredOwnerId = null)
    {
        var filterBuilder = Builders<Asset>.Filter;
        var filter = filterBuilder.And(
            filterBuilder.Eq(x => x.Id, id),
            filterBuilder.Eq(x => x.IsAvailable, false)
        );
        
        // If requiredOwnerId is provided, also check ownership
        if (!string.IsNullOrEmpty(requiredOwnerId))
        {
            filter = filterBuilder.And(filter, filterBuilder.Eq(x => x.BookedBy, requiredOwnerId));
        }

        var update = Builders<Asset>.Update
            .Set(x => x.IsAvailable, true)
            .Set(x => x.BookedBy, (string?)null)
            .Set(x => x.BookedByFullName, (string?)null);

        var result = await _assetsCollection.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    public virtual async Task RemoveAsync(string id) =>
        await _assetsCollection.DeleteOneAsync(x => x.Id == id);

    /// <summary>
    /// Calculates dashboard statistics (Total, Available, InUse) via efficient Count queries.
    /// </summary>
    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var total = await _assetsCollection.CountDocumentsAsync(_ => true);
        var available = await _assetsCollection.CountDocumentsAsync(a => a.IsAvailable);
        
        return new DashboardStatsDto
        {
            TotalAssets = (int)total,
            AvailableAssets = (int)available,
            InUseAssets = (int)(total - available)
        };
    }
}