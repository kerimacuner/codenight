namespace TurkcellDecisionEngine.Api.DTOs;

// UI Config DTOs
public class ActionLabelConfig
{
    public string Label { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string DefaultMessage { get; set; } = string.Empty;
}

public class RiskLabelConfig
{
    public string Label { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

public class UiConfig
{
    public Dictionary<string, ActionLabelConfig> ActionLabels { get; set; } = new();
    public Dictionary<string, RiskLabelConfig> RiskLabels { get; set; } = new();
    public string FallbackMessage { get; set; } = "Hesabınızla ilgili bir güncelleme var.";
    public string DefaultNotificationTitle { get; set; } = "Bildirim";
    public string DefaultNotificationMessage { get; set; } = "Turkcell size önemli bir bildirim gönderiyor.";
}

// Scenario DTOs
public class ScenarioEvent
{
    public string UserId { get; set; } = string.Empty;
    public string Service { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Unit { get; set; } = string.Empty;
}

public class ScenarioConfig
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public List<ScenarioEvent> Events { get; set; } = new();
}

// Response DTOs
public class UiConfigResponse
{
    public Dictionary<string, ActionLabelConfig> ActionLabels { get; set; } = new();
    public Dictionary<string, RiskLabelConfig> RiskLabels { get; set; } = new();
    public string FallbackMessage { get; set; } = string.Empty;
    public string DefaultNotificationTitle { get; set; } = string.Empty;
    public string DefaultNotificationMessage { get; set; } = string.Empty;
}

public class ScenariosResponse
{
    public List<ScenarioConfig> Scenarios { get; set; } = new();
}
