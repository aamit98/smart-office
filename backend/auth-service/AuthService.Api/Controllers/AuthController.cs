using AuthService.Api.DTOs; 
using AuthService.Api.Services;  
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Api.Controllers;


[ApiController]
[Route("api/[controller]")]

public class AuthController: ControllerBase 
{
    private readonly IAuthService _authService; 

    public AuthController(IAuthService authService){
        _authService = authService; 
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register(UserRegisterDto request){
        var token = await _authService.RegisterAsync(request); 
        if(token == null){
            return BadRequest("User already exists"); 
        }
        return Ok(new {Token = token}); 
    }
    [HttpPost("login")]
     public async Task<IActionResult> Login(UserLoginDto request){
        var token = await _authService.LoginAsync(request); 
        if(token == null){
            return Unauthorized("Invalid credentials"); 
        }
           return Ok(new {Token = token}); 
     }
}