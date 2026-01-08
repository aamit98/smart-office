using AuthService.Api.Data;
using AuthService.Api.DTOs;
using AuthService.Api.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text; 
using Microsoft.IdentityModel.Tokens;

namespace AuthService.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    /// <summary>
    /// Registers a new user in the system.
    /// Hashes the password using BCrypt and generates an initial JWT token.
    /// </summary>
    /// <param name="request">DTO containing registration details (Username, Password, FullName, Role)</param>
    /// <returns>A JWT string if successful; otherwise null if username exists.</returns>
    public async Task<string?> RegisterAsync(UserRegisterDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        {
            return null;
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            // ...existing code...
            Username = request.Username,
            FullName = request.FullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return GenerateJwtToken(user);
    }

    /// <summary>
    /// Authenticates a user by verifying their credentials.
    /// </summary>
    /// <param name="request">DTO containing login credentials</param>
    /// <returns>A JWT string if authentication succeeds; otherwise null.</returns>
    public async Task<string?> LoginAsync(UserLoginDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null)
        {
            return null;
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null; // Invalid password
        }

        return GenerateJwtToken(user);
    }

    /// <summary>
    /// Generates a unified JWT token containing standard claims (Sub, UniqueName)
    /// and custom claims (FullName, Role).
    /// </summary>
    private string GenerateJwtToken(User user)
    {
        // SECURITY: JWT Secret must be provided via Environment Variable or Configuration.
        // No hardcoded fallback - forces proper configuration in all environments.
        var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET") 
                        ?? _configuration["JwtSettings:Key"] 
                        ?? throw new InvalidOperationException("JWT_SECRET environment variable or JwtSettings:Key configuration is required.");
        
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim("FullName", user.FullName ?? user.Username), // Add FullName claim
            new Claim(ClaimTypes.Role, user.Role)
        };

        // Check for token expiry configuration, defaulting to 60 minutes if invalid or missing.
        var expiryMinutesStr = _configuration["JwtSettings:ExpiryInMinutes"] ?? "60";
        if (!double.TryParse(expiryMinutesStr, out var expiryMinutes))
        {
            expiryMinutes = 60;
        }

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes), 
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}