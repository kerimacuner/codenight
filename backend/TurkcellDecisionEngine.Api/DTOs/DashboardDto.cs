namespace TurkcellDecisionEngine.Api.DTOs;

public class DashboardSummaryDto
{
    public int TotalUsers { get; set; }
    public int TotalEventsToday { get; set; }
    public int TotalDecisionsToday { get; set; }
    public int ActiveRules { get; set; }
    public Dictionary<string, int> ActionCountsToday { get; set; } = new();
    public Dictionary<string, int> RiskLevelDistribution { get; set; } = new();
    public List<EventResponseDto> RecentEvents { get; set; } = new();
    public List<DecisionResponseDto> RecentDecisions { get; set; } = new();
}
