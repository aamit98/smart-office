using ResourceService.Api.Models;
using MongoDB.Driver;

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


    public async Task<List<Asset>> GetAsync() =>
        await _assetsCollection.Find(_ => true).ToListAsync();

    public async Task<Asset?> GetAsync(string id) =>
        await _assetsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();


    public async Task CreateAsync(Asset newAsset) =>
        await _assetsCollection.InsertOneAsync(newAsset);


    public async Task RemoveAsync(string id) =>
        await _assetsCollection.DeleteOneAsync(x => x.Id == id);
}