namespace TurkcellDecisionEngine.Core.Entities;

public class Decision
{
    public string DecisionId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string TriggeredRules { get; set; } = "[]"; // JSON array
    public string SelectedAction { get; set; } = string.Empty;
    public string SuppressedActions { get; set; } = "[]"; // JSON array
    public string Message { get; set; } = string.Empty; // Kullanıcıya gösterilecek mesaj
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public virtual User? User { get; set; }
}
