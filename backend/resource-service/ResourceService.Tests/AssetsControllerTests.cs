using Xunit;
using Moq;
using ResourceService.Api.Services;
using ResourceService.Api.Controllers;
using ResourceService.Api.Models;
using MongoDB.Driver;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace ResourceService.Tests
{
    public class AssetsControllerTests
    {
        private readonly Mock<IMongoDatabase> _mockDatabase;
        private readonly Mock<IMongoCollection<Asset>> _mockCollection;
        private readonly Mock<AssetsService> _mockAssetsService; // Determine if we mock service or use real one. 
        // using real service requires mocking DB which is hard for Find. 
        // using mocked service is easier now that methods are virtual.
        
        private readonly AssetsController _controller;

        public AssetsControllerTests()
        {
            // We use a partial mock or full mock of AssetsService
            // Since we made methods virtual, we can mock GetAsync directly.
            _mockDatabase = new Mock<IMongoDatabase>(); // Just internal dependency
            _mockCollection = new Mock<IMongoCollection<Asset>>();
            _mockDatabase.Setup(d => d.GetCollection<Asset>("Assets", null)).Returns(_mockCollection.Object);

            _mockAssetsService = new Mock<AssetsService>(_mockDatabase.Object);
            
            _controller = new AssetsController(_mockAssetsService.Object);
        }

        [Fact]
        public async Task Update_ReleaseManualBooking_AsMember_ShouldReturnForbid()
        {
            // Arrange
            var assetId = "asset1";
            var existingAsset = new Asset 
            { 
                Id = assetId, 
                Name = "Desk 1", 
                IsAvailable = false, 
                BookedBy = "manual",
                BookedByFullName = "Kendall"
            };

            var updateRequest = new Asset 
            { 
                Id = assetId, 
                Name = "Desk 1", 
                IsAvailable = true // Start RELEASE action
            };

            // Setup Service to return existing asset
            _mockAssetsService.Setup(s => s.GetAsync(assetId)).ReturnsAsync(existingAsset);

            // Setup User Context (Member, not Admin)
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "user123"),
                new Claim(ClaimTypes.Role, "Member")
            }, "mock"));

            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };

            // Act
            var result = await _controller.Update(assetId, updateRequest);

            // Assert
            Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task Update_ReleaseManualBooking_AsAdmin_ShouldReturnReview()
        {
            // Arrange
            var assetId = "asset1";
            var existingAsset = new Asset 
            { 
                Id = assetId, 
                Name = "Desk 1", 
                IsAvailable = false, 
                BookedBy = "manual"
            };

            var updateRequest = new Asset 
            { 
                Id = assetId, 
                IsAvailable = true // Release
            };

            _mockAssetsService.Setup(s => s.GetAsync(assetId)).ReturnsAsync(existingAsset);
            _mockAssetsService.Setup(s => s.TryReleaseAssetAsync(assetId, null)).ReturnsAsync(true);

            // Setup User Context (Admin)
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "admin123"),
                new Claim(ClaimTypes.Role, "Admin")
            }, "mock"));

            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };

            // Act
            var result = await _controller.Update(assetId, updateRequest);

            // Assert
            // It might currently return NoContent() or Ok() depending on implementation detail of Update.
            // Looking at code: return NoContent();
            Assert.IsType<NoContentResult>(result);
        }
    }
}
