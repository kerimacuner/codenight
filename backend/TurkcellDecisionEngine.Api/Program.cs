using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TurkcellDecisionEngine.Api.Hubs;
using TurkcellDecisionEngine.Api.Services;
using TurkcellDecisionEngine.Core.Interfaces;
using TurkcellDecisionEngine.Infrastructure.Data;
using TurkcellDecisionEngine.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Add SignalR
builder.Services.AddSignalR();

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

    // Configure JWT for SignalR
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("PresenterOnly", policy => policy.RequireRole("Presenter", "Admin"));
    options.AddPolicy("UserOnly", policy => policy.RequireRole("User", "Admin", "Presenter"));
});

// Register services
builder.Services.AddScoped<INotificationService, BipNotificationService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<DbSeeder>();

// Register SignalR notifier as singleton (uses IHubContext which is thread-safe)
builder.Services.AddSingleton<IRealtimeNotifier, SignalRNotifier>();

// Register other services that depend on IRealtimeNotifier
builder.Services.AddScoped<IUserStateManager, UserStateManager>();
builder.Services.AddScoped<IRuleEngine, RuleEngine>();
builder.Services.AddScoped<IActionManager, ActionManager>();
builder.Services.AddScoped<IEventProcessor, EventProcessor>();

// Register LLM service for AI-powered rule generation
builder.Services.AddScoped<ILlmService, OpenAiLlmService>();

// Configure CORS for React frontend and SignalR (Local Network Support)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.SetIsOriginAllowed(_ => true) // Allow any origin for local network access
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials(); // Required for SignalR
    });
});

var app = builder.Build();

// Database migration and seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var dbContext = services.GetRequiredService<AppDbContext>();
    var seeder = services.GetRequiredService<DbSeeder>();
    var logger = services.GetRequiredService<ILogger<DbSeeder>>();
    
    // Check if we should reset the database (for development/demo)
    var resetDb = Environment.GetEnvironmentVariable("RESET_DATABASE") == "true";
    if (resetDb)
    {
        logger.LogWarning("Resetting database as requested...");
        await dbContext.Database.EnsureDeletedAsync();
    }
    
    // Ensure database and schema are created
    await dbContext.Database.EnsureCreatedAsync();
    
    // Seed the database
    await seeder.SeedAsync();
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

// Map SignalR hub
app.MapHub<DecisionHub>("/hubs/decision");

app.Run();
