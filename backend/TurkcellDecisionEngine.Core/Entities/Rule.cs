namespace TurkcellDecisionEngine.Core.Entities;

public class Rule
{
    public string RuleId { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public int Priority { get; set; }
    public bool IsActive { get; set; } = true;
}
