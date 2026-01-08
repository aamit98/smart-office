using AuthService.Api.Data;
using Microsoft.EntityFrameworkCore;
using AuthService.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();


builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SmartOffice Auth API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});


builder.Services.AddScoped<IAuthService, AuthService.Api.Services.AuthService>();

var jwtSettings = builder.Configuration.GetSection("JwtSettings");


var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET") 
                ?? jwtSettings["Key"] 
                ?? "SecretKeyForDev_MustBeLongEnough_12345";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
    };
});


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Retry logic for database migration
    var retries = 5;
    while (retries > 0)
    {
        try
        {
            Console.WriteLine($"Attempting to connect to database... ({5 - retries + 1}/5)");
            db.Database.Migrate();
            Console.WriteLine("Database migration successful!");
            break;
        }
        catch (Exception ex)
        {
            retries--;
            if (retries == 0)
            {
                Console.WriteLine($"Migration failed after 5 attempts: {ex.Message}");
                throw;
            }
            Console.WriteLine($"Migration failed: {ex.Message}. Retrying in 5 seconds...");
            System.Threading.Thread.Sleep(5000);
        }
    }
}

app.UseCors("AllowFrontend");
app.UseAuthentication(); 
app.UseAuthorization(); 

app.MapControllers();

app.Run();