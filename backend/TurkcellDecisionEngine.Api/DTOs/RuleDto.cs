namespace TurkcellDecisionEngine.Api.DTOs;

public class CreateRuleDto
{
    public string? RuleId { get; set; }
    public string Condition { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public int Priority { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateRuleDto
{
    public string Condition { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public int Priority { get; set; }
    public bool IsActive { get; set; }
}

public class RuleResponseDto
{
    public string RuleId { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public int Priority { get; set; }
    public bool IsActive { get; set; }
}
