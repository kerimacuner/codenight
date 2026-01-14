using TurkcellDecisionEngine.Core.Enums;

namespace TurkcellDecisionEngine.Core.Entities;

public class UserState
{
    public string UserId { get; set; } = string.Empty;
    public decimal InternetTodayGb { get; set; }
    public decimal SpendTodayTry { get; set; }
    public int ContentMinutesToday { get; set; }
    public RiskLevel RiskLevel { get; set; } = RiskLevel.LOW;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public virtual User? User { get; set; }
}
