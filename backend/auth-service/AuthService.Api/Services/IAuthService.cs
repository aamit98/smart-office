using AuthService.Api.DTOs;
using AuthService.Api.Models;


namespace AuthService.Api.Services; 


public interface IAuthService{

    Task<string?> RegisterAsync(UserRegisterDto request); 
    Task<string?> LoginAsync(UserLoginDto request);


    
}