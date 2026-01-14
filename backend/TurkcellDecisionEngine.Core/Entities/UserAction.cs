namespace TurkcellDecisionEngine.Core.Entities;

public class UserAction
{
    public string ActionId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string ActionType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public virtual User? User { get; set; }
}
