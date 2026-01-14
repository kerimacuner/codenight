namespace TurkcellDecisionEngine.Api.DTOs;

public class CreateEventDto
{
    public string? EventId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Service { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateTime? Timestamp { get; set; }
}

public class EventResponseDto
{
    public string EventId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public string Service { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
