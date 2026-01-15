using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TurkcellDecisionEngine.Api.DTOs;

namespace TurkcellDecisionEngine.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Presenter")]
public class SimulationController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public SimulationController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet("config")]
    public IActionResult GetConfig()
    {
        var config = _configuration.GetSection("SimulationConfig").Get<SimulationConfig>();
        
        if (config == null)
        {
            // Return default config if not configured
            config = new SimulationConfig
            {
                Services = new List<SimulationServiceConfig>
                {
                    new() { Name = "Superonline", EventType = "DATA_USAGE", Unit = "GB", NormalMin = 0.5, NormalMax = 5, AggressiveMin = 8, AggressiveMax = 20 },
                    new() { Name = "Paycell", EventType = "PAYMENT", Unit = "TRY", NormalMin = 10, NormalMax = 100, AggressiveMin = 150, AggressiveMax = 500 },
                    new() { Name = "TV+", EventType = "STREAMING", Unit = "MIN", NormalMin = 10, NormalMax = 60, AggressiveMin = 90, AggressiveMax = 200 },
                    new() { Name = "Fizy", EventType = "STREAMING", Unit = "MIN", NormalMin = 15, NormalMax = 45, AggressiveMin = 60, AggressiveMax = 150 },
                    new() { Name = "BiPLive", EventType = "STREAMING", Unit = "MIN", NormalMin = 5, NormalMax = 30, AggressiveMin = 45, AggressiveMax = 120 },
                    new() { Name = "Game+", EventType = "STREAMING", Unit = "MIN", NormalMin = 20, NormalMax = 60, AggressiveMin = 90, AggressiveMax = 180 },
                },
                AggressiveProbability = 0.3,
                DefaultIntervalSeconds = 3,
                MinIntervalSeconds = 1,
                MaxIntervalSeconds = 10
            };
        }

        return Ok(config);
    }
}
