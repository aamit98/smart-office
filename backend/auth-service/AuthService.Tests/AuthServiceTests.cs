using Xunit;
using Moq;
using AuthService.Api.Services;
using AuthService.Api.DTOs;
using AuthService.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;
using AuthService.Api.Models;
using System.Collections.Generic;

namespace AuthService.Tests
{
    public class AuthServiceTests
    {
        private readonly AppDbContext _context;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly AuthService.Api.Services.AuthService _authService;

        public AuthServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _mockConfig = new Mock<IConfiguration>();
            
            // Mock JWT settings
            _mockConfig.Setup(c => c["JwtSettings:Key"]).Returns("SuperSecretKeyForTesting1234567890");
            _mockConfig.Setup(c => c["JwtSettings:Issuer"]).Returns("SmartOffice");
            _mockConfig.Setup(c => c["JwtSettings:Audience"]).Returns("SmartOfficeUser");
            _mockConfig.Setup(c => c["JwtSettings:ExpiryInMinutes"]).Returns("60");

            _authService = new AuthService.Api.Services.AuthService(_context, _mockConfig.Object);
        }

        [Fact]
        public async Task RegisterAsync_ShouldReturnToken_WhenUserIsValid()
        {
            // Arrange
            var registerDto = new UserRegisterDto
            {
                Username = "testuser",
                FullName = "Test User",
                Password = "password123",
                Role = "Member"
            };

            // Act
            var token = await _authService.RegisterAsync(registerDto);

            // Assert
            Assert.NotNull(token);
            Assert.NotEmpty(token);
            
            // Verify user was added to DB
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == "testuser");
            Assert.NotNull(user);
            Assert.Equal("Test User", user.FullName);
        }

        [Fact]
        public async Task RegisterAsync_ShouldReturnNull_WhenUserAlreadyExists()
        {
            // Arrange
            var existingUser = new User
            {
                Id = Guid.NewGuid(),
                Username = "existinguser",
                FullName = "Existing User",
                PasswordHash = "hash",
                Role = "Member"
            };
            _context.Users.Add(existingUser);
            await _context.SaveChangesAsync();

            var registerDto = new UserRegisterDto
            {
                Username = "existinguser",
                FullName = "New Name",
                Password = "password123",
                Role = "Member"
            };

            // Act
            var token = await _authService.RegisterAsync(registerDto);

            // Assert
            Assert.Null(token);
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnToken_WhenCredentialsAreCorrect()
        {
            // Arrange
            var password = "password123";
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = "loginuser",
                FullName = "Login User",
                PasswordHash = hashedPassword,
                Role = "Member"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var loginDto = new UserLoginDto
            {
                Username = "loginuser",
                Password = "password123"
            };

            // Act
            var token = await _authService.LoginAsync(loginDto);

            // Assert
            Assert.NotNull(token);
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnNull_WhenPasswordIsInvalid()
        {
             // Arrange
            var password = "password123";
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = "wrongpassuser",
                FullName = "Login User",
                PasswordHash = hashedPassword,
                Role = "Member"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var loginDto = new UserLoginDto
            {
                Username = "wrongpassuser",
                Password = "wrongpassword"
            };

            // Act
            var token = await _authService.LoginAsync(loginDto);

            // Assert
            Assert.Null(token);
        }
    }
}
