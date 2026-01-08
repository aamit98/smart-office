using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc; 
using System.Security.Claims; 


namespace AuthService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController: ControllerBase 
{
    [Authorize]
    [HttpGet("me")]
    public IActionResult GetMyProfile(){
        var username =User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;  
        var id= User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Ok(new 
                { 
                    Message = "Welcome to the VIP area!", 
                    YourUsername = username,
                    YourRole = role,
                    YourId = id
                });

    }
}