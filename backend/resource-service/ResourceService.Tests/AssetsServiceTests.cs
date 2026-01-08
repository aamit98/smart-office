using Xunit;
using Moq;
using ResourceService.Api.Services;
using ResourceService.Api.Models;
using MongoDB.Driver;
using System.Threading;
using System.Threading.Tasks;

namespace ResourceService.Tests
{
    public class AssetsServiceTests
    {
        private readonly Mock<IMongoCollection<Asset>> _mockCollection;
        private readonly Mock<IMongoDatabase> _mockDatabase;
        private readonly AssetsService _assetsService;

        public AssetsServiceTests()
        {
            _mockCollection = new Mock<IMongoCollection<Asset>>();
            _mockDatabase = new Mock<IMongoDatabase>();

            _mockDatabase.Setup(d => d.GetCollection<Asset>("Assets", null))
                .Returns(_mockCollection.Object);

            _assetsService = new AssetsService(_mockDatabase.Object);
        }

        [Fact]
        public async Task CreateAsync_ShouldInsertAsset()
        {
            // Arrange
            var asset = new Asset { Id = "1", Name = "Test Asset", Type = "Room", IsAvailable = true };

            // Act
            await _assetsService.CreateAsync(asset);

            // Assert
            _mockCollection.Verify(c => c.InsertOneAsync(asset, null, default), Times.Once);
        }

        [Fact]
        public async Task RemoveAsync_ShouldDeleteAsset()
        {
            // Arrange
            var assetId = "123";
            _mockCollection.Setup(c => c.DeleteOneAsync(It.IsAny<FilterDefinition<Asset>>(), default))
                .ReturnsAsync(new DeleteResult.Acknowledged(1));

            // Act
            await _assetsService.RemoveAsync(assetId);

            // Assert
            _mockCollection.Verify(c => c.DeleteOneAsync(It.IsAny<FilterDefinition<Asset>>(), default), Times.Once);
        }
    }
}
