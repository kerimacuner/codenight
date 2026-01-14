namespace TurkcellDecisionEngine.Api.DTOs;

public class UserStateResponseDto
{
    public string UserId { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public string? City { get; set; }
    public decimal InternetTodayGb { get; set; }
    public decimal SpendTodayTry { get; set; }
    public int ContentMinutesToday { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; }
}
