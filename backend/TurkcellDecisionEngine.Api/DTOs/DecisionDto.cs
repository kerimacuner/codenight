namespace TurkcellDecisionEngine.Api.DTOs;

public class DecisionResponseDto
{
    public string DecisionId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public List<string> TriggeredRules { get; set; } = new();
    public string SelectedAction { get; set; } = string.Empty;
    public List<string> SuppressedActions { get; set; } = new();
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class ProcessEventResultDto
{
    public EventResponseDto Event { get; set; } = new();
    public UserStateResponseDto UserState { get; set; } = new();
    public DecisionResponseDto? Decision { get; set; }
}
