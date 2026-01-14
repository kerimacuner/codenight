namespace TurkcellDecisionEngine.Core.Entities;

public class Event
{
    public string EventId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Service { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    
    // Navigation property
    public virtual User? User { get; set; }
}
