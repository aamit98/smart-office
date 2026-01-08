using ResourceService.Api.Models;
using MongoDB.Driver;
using ResourceService.Api.DTOs;


namespace ResourceService.Api.Services;

public class AssetsService
{
    private readonly IMongoCollection<Asset> _assetsCollection;

    public AssetsService(IConfiguration config)
    {
     
        var connectionString = config.GetConnectionString("MongoConnection");
        var mongoClient = new MongoClient(connectionString);
        var mongoDatabase = mongoClient.GetDatabase("SmartOfficeAssetsDB");

        _assetsCollection = mongoDatabase.GetCollection<Asset>("Assets");
    }

    public async Task<PaginatedResponse<Asset>> GetPaginatedAsync(int page, int pageSize, bool? isAvailable = null)
    {
        var filterBuilder = Builders<Asset>.Filter;
        var filter = filterBuilder.Empty;

        if (isAvailable.HasValue)
        {
            filter &= filterBuilder.Eq(x => x.IsAvailable, isAvailable.Value);
        }

        var totalCount = await _assetsCollection.CountDocumentsAsync(filter); 
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

    public async Task<List<Asset>> GetAsync() =>
        await _assetsCollection.Find(_ => true).ToListAsync();

    public async Task<Asset?> GetAsync(string id) =>
        await _assetsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();


    public async Task CreateAsync(Asset newAsset) =>
        await _assetsCollection.InsertOneAsync(newAsset);

    public async Task UpdateAsync(string id, Asset updatedAsset) =>
        await _assetsCollection.ReplaceOneAsync(x => x.Id == id, updatedAsset);

    public async Task RemoveAsync(string id) =>
        await _assetsCollection.DeleteOneAsync(x => x.Id == id);

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