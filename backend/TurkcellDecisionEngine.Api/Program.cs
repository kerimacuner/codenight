using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TurkcellDecisionEngine.Core.Interfaces;
using TurkcellDecisionEngine.Infrastructure.Data;
using TurkcellDecisionEngine.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Configure PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "TurkcellDecisionEngineSecretKey2024VeryLongSecretKey!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "TurkcellDecisionEngine";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "TurkcellDecisionEngine";

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
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("PresenterOnly", policy => policy.RequireRole("Presenter", "Admin"));
    options.AddPolicy("UserOnly", policy => policy.RequireRole("User", "Admin", "Presenter"));
});

// Register services
builder.Services.AddScoped<IEventProcessor, EventProcessor>();
builder.Services.AddScoped<IUserStateManager, UserStateManager>();
builder.Services.AddScoped<IRuleEngine, RuleEngine>();
builder.Services.AddScoped<IActionManager, ActionManager>();
builder.Services.AddScoped<INotificationService, BipNotificationService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Configure CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Ensure database is created and load seed data from CSV
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var dbContext = services.GetRequiredService<AppDbContext>();
    var logger = services.GetRequiredService<ILogger<CsvSeedDataLoader>>();
    
    // Check if we should reset the database (for development/demo)
    var resetDb = Environment.GetEnvironmentVariable("RESET_DATABASE") == "true";
    if (resetDb && app.Environment.IsDevelopment())
    {
        logger.LogWarning("Resetting database as requested...");
        dbContext.Database.EnsureDeleted();
    }
    
    // Ensure database is created
    dbContext.Database.EnsureCreated();
    
    // Load seed data from CSV files
    var seedDataPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "Seeddata");
    if (Directory.Exists(seedDataPath))
    {
        var seedLoader = new CsvSeedDataLoader(dbContext, logger, seedDataPath);
        await seedLoader.LoadAllSeedDataAsync();
    }
    else
    {
        logger.LogWarning("Seeddata folder not found at {Path}", seedDataPath);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
