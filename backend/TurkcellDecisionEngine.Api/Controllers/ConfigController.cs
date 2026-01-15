using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TurkcellDecisionEngine.Api.DTOs;

namespace TurkcellDecisionEngine.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfigController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public ConfigController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// Get UI configuration (action labels, risk labels, messages)
    /// </summary>
    [HttpGet("ui")]
    [AllowAnonymous]
    public IActionResult GetUiConfig()
    {
        var uiConfig = _configuration.GetSection("UiConfig").Get<UiConfig>();
        
        if (uiConfig == null)
        {
            // Return default config if not configured
            uiConfig = GetDefaultUiConfig();
        }

        return Ok(uiConfig);
    }

    /// <summary>
    /// Get demo scenarios for presenter mode
    /// </summary>
    [HttpGet("scenarios")]
    [Authorize(Roles = "Admin,Presenter")]
    public IActionResult GetScenarios()
    {
        var scenarios = _configuration.GetSection("Scenarios").Get<List<ScenarioConfig>>();
        
        if (scenarios == null || scenarios.Count == 0)
        {
            scenarios = GetDefaultScenarios();
        }

        return Ok(new ScenariosResponse { Scenarios = scenarios });
    }

    private UiConfig GetDefaultUiConfig()
    {
        return new UiConfig
        {
            ActionLabels = new Dictionary<string, ActionLabelConfig>
            {
                ["DATA_USAGE_WARNING"] = new() { Label = "Veri Uyarısı", Color = "blue", Title = "İnternet Kullanım Uyarısı", DefaultMessage = "Günlük internet kullanımınız yüksek seviyeye ulaştı." },
                ["DATA_USAGE_NUDGE"] = new() { Label = "Veri Hatırlatması", Color = "cyan", Title = "İnternet Kullanım Bildirimi", DefaultMessage = "İnternet kullanımınız artıyor." },
                ["SPEND_ALERT"] = new() { Label = "Harcama Uyarısı", Color = "orange", Title = "Harcama Uyarısı", DefaultMessage = "Bugünkü harcamalarınız belirlenen limiti aştı." },
                ["SPEND_NUDGE"] = new() { Label = "Harcama Hatırlatması", Color = "amber", Title = "Harcama Bildirimi", DefaultMessage = "Harcamalarınız orta seviyede." },
                ["CONTENT_SUGGESTION"] = new() { Label = "İçerik Önerisi", Color = "purple", Title = "İçerik Önerisi", DefaultMessage = "Yoğun içerik tüketimi yaptınız." },
                ["CONTENT_COOLDOWN_SUGGESTION"] = new() { Label = "Mola Önerisi", Color = "pink", Title = "Mola Önerisi", DefaultMessage = "Uzun süredir içerik tüketiyorsunuz." },
                ["CRITICAL_ALERT"] = new() { Label = "Kritik Uyarı", Color = "red", Title = "Kritik Uyarı!", DefaultMessage = "Kullanımınız kritik seviyede." }
            },
            RiskLabels = new Dictionary<string, RiskLabelConfig>
            {
                ["LOW"] = new() { Label = "Düşük", Color = "green" },
                ["MEDIUM"] = new() { Label = "Orta", Color = "yellow" },
                ["HIGH"] = new() { Label = "Yüksek", Color = "orange" },
                ["CRITICAL"] = new() { Label = "Kritik", Color = "red" }
            },
            FallbackMessage = "Hesabınızla ilgili bir güncelleme var.",
            DefaultNotificationTitle = "Bildirim",
            DefaultNotificationMessage = "Turkcell size önemli bir bildirim gönderiyor."
        };
    }

    private List<ScenarioConfig> GetDefaultScenarios()
    {
        return new List<ScenarioConfig>
        {
            new()
            {
                Id = "high-usage",
                Name = "Yüksek İnternet",
                Description = "Kullanıcının internet kotasını hızla tüketir",
                Color = "blue",
                Events = new List<ScenarioEvent>
                {
                    new() { UserId = "U1", Service = "Superonline", EventType = "DATA_USAGE", Value = 5, Unit = "GB" },
                    new() { UserId = "U1", Service = "Superonline", EventType = "DATA_USAGE", Value = 8, Unit = "GB" }
                }
            },
            new()
            {
                Id = "spending-spree",
                Name = "Yüksek Harcama",
                Description = "Kullanıcının harcama limitini aşar",
                Color = "green",
                Events = new List<ScenarioEvent>
                {
                    new() { UserId = "U2", Service = "Paycell", EventType = "PAYMENT", Value = 150, Unit = "TRY" },
                    new() { UserId = "U2", Service = "Paycell", EventType = "PAYMENT", Value = 200, Unit = "TRY" }
                }
            },
            new()
            {
                Id = "content-binge",
                Name = "İçerik Maratonu",
                Description = "Kullanıcının yoğun içerik tüketimi",
                Color = "purple",
                Events = new List<ScenarioEvent>
                {
                    new() { UserId = "U3", Service = "TV+", EventType = "STREAMING", Value = 120, Unit = "MIN" },
                    new() { UserId = "U3", Service = "Fizy", EventType = "STREAMING", Value = 90, Unit = "MIN" }
                }
            },
            new()
            {
                Id = "critical-user",
                Name = "Kritik Kullanıcı",
                Description = "Tüm limitleri aşan kritik senaryo",
                Color = "red",
                Events = new List<ScenarioEvent>
                {
                    new() { UserId = "U4", Service = "Superonline", EventType = "DATA_USAGE", Value = 18, Unit = "GB" },
                    new() { UserId = "U4", Service = "Paycell", EventType = "PAYMENT", Value = 350, Unit = "TRY" },
                    new() { UserId = "U4", Service = "TV+", EventType = "STREAMING", Value = 180, Unit = "MIN" }
                }
            }
        };
    }
}
