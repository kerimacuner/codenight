namespace TurkcellDecisionEngine.Api.DTOs;

public class SimulationServiceConfig
{
    public string Name { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public double NormalMin { get; set; }
    public double NormalMax { get; set; }
    public double AggressiveMin { get; set; }
    public double AggressiveMax { get; set; }
}

public class SimulationConfig
{
    public List<SimulationServiceConfig> Services { get; set; } = new();
    public double AggressiveProbability { get; set; } = 0.3;
    public int DefaultIntervalSeconds { get; set; } = 3;
    public int MinIntervalSeconds { get; set; } = 1;
    public int MaxIntervalSeconds { get; set; } = 10;
}
