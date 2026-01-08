using ResourceService.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models; // Added
using System.Text;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SmartOffice Resource API", Version = "v1" });

    // Configure Swagger Authorize button
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

builder.Services.AddSingleton<IMongoClient>(sp =>
    new MongoClient(builder.Configuration.GetConnectionString("MongoConnection")));

builder.Services.AddSingleton<IMongoDatabase>(sp =>
    sp.GetRequiredService<IMongoClient>().GetDatabase("SmartOfficeAssetsDB"));

builder.Services.AddSingleton<AssetsService>();
builder.Services.AddSingleton<DbSeeder>(); // Register Seeder

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:5173") // Frontend URL
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

var jwtIssuer = Environment.GetEnvironmentVariable("JwtSettings__Issuer") ?? builder.Configuration["JwtSettings:Issuer"] ?? "SmartOfficeAuth";
var jwtAudience = Environment.GetEnvironmentVariable("JwtSettings__Audience") ?? builder.Configuration["JwtSettings:Audience"] ?? "SmartOfficeClient";
// JWT Secret must be provided via environment variable for token validation
var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET") 
                ?? throw new InvalidOperationException("JWT_SECRET environment variable must be configured.");

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
        ValidIssuer = jwtIssuer, 
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

var app = builder.Build();

// Seed demo data on startup
try 
{
    var seeder = app.Services.GetRequiredService<DbSeeder>();
    await seeder.SeedAsync();
}
catch
{
    // Seeding is non-critical; application continues if it fails
}

app.UseSwagger();
app.UseSwaggerUI(c => 
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartOffice Resource API V1");
});

app.MapGet("/", () => $"Resource Service is running! Environment: {app.Environment.EnvironmentName}");

app.UseCors("AllowFrontend");
app.UseAuthentication(); 
app.UseAuthorization(); 


app.MapControllers();

app.Run();