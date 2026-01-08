namespace AuthService.Api.Models;

public class User{


    public Guid Id{get; set; }
    public string Username {get;set;} = string.Empty;
    public string FullName { get; set; } = string.Empty; // Added FullName
    public string PasswordHash {get ; set; }=string.Empty;
    public string Role {get; set; }= string.Empty; 


}

