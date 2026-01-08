using AuthService.Api.DTOs; 
using AuthService.Api.Services;  
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Api.Controllers;

/// <summary>
/// Handles user authentication operations including registration and login.
/// Issues JWT tokens for authenticated sessions.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase 
{
    private readonly IAuthService _authService; 

    public AuthController(IAuthService authService)
    {
        _authService = authService; 
    }

    /// <summary>
    /// Registers a new user account.
    /// </summary>
    /// <param name="request">User registration details including username, password, fullName, and role.</param>
    /// <returns>JWT token on success; BadRequest if username already exists.</returns>
    [HttpPost("register")]
    public async Task<IActionResult> Register(UserRegisterDto request)
    {
        var token = await _authService.RegisterAsync(request); 
        if (token == null)
        {
            return BadRequest("User already exists"); 
        }
        return Ok(new { Token = token }); 
    }

    /// <summary>
    /// Authenticates an existing user.
    /// </summary>
    /// <param name="request">Login credentials (username and password).</param>
    /// <returns>JWT token on success; Unauthorized if credentials are invalid.</returns>
    [HttpPost("login")]
    public async Task<IActionResult> Login(UserLoginDto request)
    {
        var token = await _authService.LoginAsync(request); 
        if (token == null)
        {
            return Unauthorized("Invalid credentials"); 
        }
        return Ok(new { Token = token }); 
    }
}