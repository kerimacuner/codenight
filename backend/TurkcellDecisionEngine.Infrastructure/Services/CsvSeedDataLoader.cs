using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TurkcellDecisionEngine.Core.Entities;
using TurkcellDecisionEngine.Core.Enums;
using TurkcellDecisionEngine.Infrastructure.Data;

namespace TurkcellDecisionEngine.Infrastructure.Services;

public class CsvSeedDataLoader
{
    private readonly AppDbContext _context;
    private readonly ILogger<CsvSeedDataLoader> _logger;
    private readonly string _seedDataPath;

    public CsvSeedDataLoader(AppDbContext context, ILogger<CsvSeedDataLoader> logger, string seedDataPath)
    {
        _context = context;
        _logger = logger;
        _seedDataPath = seedDataPath;
    }

    public async Task LoadAllSeedDataAsync()
    {
        try
        {
            _logger.LogInformation("Starting seed data loading from {Path}", _seedDataPath);

            // Load in order of dependencies
            await LoadUsersAsync();
            await LoadUserStatesAsync();
            await LoadRulesAsync();
            await LoadEventsAsync();
            await LoadDecisionsAsync();
            await LoadActionsAsync();

            _logger.LogInformation("Seed data loading completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading seed data");
            throw;
        }
    }

    private async Task LoadUsersAsync()
    {
        var filePath = Path.Combine(_seedDataPath, "users.csv");
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("Users CSV file not found at {Path}", filePath);
            return;
        }

        var existingCount = await _context.Users.CountAsync();
        if (existingCount > 0)
        {
            _logger.LogInformation("Users already exist in database, skipping CSV load");
            return;
        }

        var lines = await File.ReadAllLinesAsync(filePath);
        var users = new List<User>();

        foreach (var line in lines.Skip(1)) // Skip header
        {
            if (string.IsNullOrWhiteSpace(line)) continue;
            
            var parts = line.Split(',');
            if (parts.Length >= 3)
            {
                var user = new User
                {
                    UserId = parts[0].Trim(),
                    Name = parts[1].Trim(),
                    City = parts[2].Trim()
                };

                // Extended format: user_id,name,city,email,password,role
                if (parts.Length >= 6)
                {
                    user.Email = parts[3].Trim();
                    
                    // Handle plain text passwords (prefix PLAIN:) or pre-hashed
                    var passwordField = parts[4].Trim();
                    if (passwordField.StartsWith("PLAIN:"))
                    {
                        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordField.Substring(6));
                    }
                    else
                    {
                        // Assume it's a plain password for demo simplicity
                        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordField);
                    }
                    
                    user.Role = parts[5].Trim().ToUpperInvariant() switch
                    {
                        "ADMIN" => UserRole.Admin,
                        "PRESENTER" => UserRole.Presenter,
                        _ => UserRole.User
                    };
                }
                else
                {
                    // Default password for legacy users (password: "123456")
                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456");
                    user.Role = UserRole.User;
                }

                users.Add(user);
            }
        }

        if (users.Any())
        {
            await _context.Users.AddRangeAsync(users);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Loaded {Count} users from CSV", users.Count);
        }
    }

    private async Task LoadUserStatesAsync()
    {
        var filePath = Path.Combine(_seedDataPath, "user_state.csv");
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("User states CSV file not found at {Path}", filePath);
            return;
        }

        var existingCount = await _context.UserStates.CountAsync();
        if (existingCount > 0)
        {
            _logger.LogInformation("User states already exist in database, skipping CSV load");
            return;
        }

        var lines = await File.ReadAllLinesAsync(filePath);
        var states = new List<UserState>();

        foreach (var line in lines.Skip(1))
        {
            if (string.IsNullOrWhiteSpace(line)) continue;
            
            var parts = line.Split(',');
            if (parts.Length >= 5)
            {
                var riskLevel = parts[4].Trim().ToUpperInvariant() switch
                {
                    "LOW" => RiskLevel.LOW,
                    "MEDIUM" => RiskLevel.MEDIUM,
                    "HIGH" => RiskLevel.HIGH,
                    "CRITICAL" => RiskLevel.CRITICAL,
                    _ => RiskLevel.LOW
                };

                states.Add(new UserState
                {
                    UserId = parts[0].Trim(),
                    InternetTodayGb = decimal.Parse(parts[1].Trim(), CultureInfo.InvariantCulture),
                    SpendTodayTry = decimal.Parse(parts[2].Trim(), CultureInfo.InvariantCulture),
                    ContentMinutesToday = (int)decimal.Parse(parts[3].Trim(), CultureInfo.InvariantCulture),
                    RiskLevel = riskLevel,
                    LastUpdated = DateTime.UtcNow
                });
            }
        }

        if (states.Any())
        {
            await _context.UserStates.AddRangeAsync(states);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Loaded {Count} user states from CSV", states.Count);
        }
    }

    private async Task LoadRulesAsync()
    {
        var filePath = Path.Combine(_seedDataPath, "rules.csv");
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("Rules CSV file not found at {Path}", filePath);
            return;
        }

        var existingCount = await _context.Rules.CountAsync();
        if (existingCount > 0)
        {
            _logger.LogInformation("Rules already exist in database, skipping CSV load");
            return;
        }

        var lines = await File.ReadAllLinesAsync(filePath);
        var rules = new List<Rule>();

        foreach (var line in lines.Skip(1))
        {
            if (string.IsNullOrWhiteSpace(line)) continue;
            
            var parts = line.Split(',');
            if (parts.Length >= 4)
            {
                rules.Add(new Rule
                {
                    RuleId = parts[0].Trim(),
                    Condition = parts[1].Trim(),
                    Action = parts[2].Trim(),
                    Priority = int.Parse(parts[3].Trim()),
                    IsActive = true
                });
            }
        }

        if (rules.Any())
        {
            await _context.Rules.AddRangeAsync(rules);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Loaded {Count} rules from CSV", rules.Count);
        }
    }

    private async Task LoadEventsAsync()
    {
        var filePath = Path.Combine(_seedDataPath, "events.csv");
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("Events CSV file not found at {Path}", filePath);
            return;
        }

        var existingCount = await _context.Events.CountAsync();
        if (existingCount > 0)
        {
            _logger.LogInformation("Events already exist in database, skipping CSV load");
            return;
        }

        var lines = await File.ReadAllLinesAsync(filePath);
        var events = new List<Event>();

        foreach (var line in lines.Skip(1))
        {
            if (string.IsNullOrWhiteSpace(line)) continue;
            
            var parts = line.Split(',');
            if (parts.Length >= 7)
            {
                events.Add(new Event
                {
                    EventId = parts[0].Trim(),
                    UserId = parts[1].Trim(),
                    Service = parts[2].Trim(),
                    EventType = parts[3].Trim(),
                    Value = decimal.Parse(parts[4].Trim(), CultureInfo.InvariantCulture),
                    Unit = parts[5].Trim(),
                    Timestamp = DateTime.Parse(parts[6].Trim(), CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind)
                });
            }
        }

        if (events.Any())
        {
            await _context.Events.AddRangeAsync(events);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Loaded {Count} events from CSV", events.Count);
        }
    }

    private async Task LoadDecisionsAsync()
    {
        var filePath = Path.Combine(_seedDataPath, "decisions.csv");
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("Decisions CSV file not found at {Path}", filePath);
            return;
        }

        var existingCount = await _context.Decisions.CountAsync();
        if (existingCount > 0)
        {
            _logger.LogInformation("Decisions already exist in database, skipping CSV load");
            return;
        }

        var lines = await File.ReadAllLinesAsync(filePath);
        var decisions = new List<Decision>();

        foreach (var line in lines.Skip(1))
        {
            if (string.IsNullOrWhiteSpace(line)) continue;
            
            var parts = line.Split(',');
            if (parts.Length >= 6)
            {
                // Convert pipe-separated rules to JSON array
                var triggeredRules = parts[2].Trim().Split('|').Where(r => !string.IsNullOrEmpty(r)).ToList();
                var suppressedActions = parts[4].Trim().Split('|').Where(a => !string.IsNullOrEmpty(a)).ToList();

                decisions.Add(new Decision
                {
                    DecisionId = parts[0].Trim(),
                    UserId = parts[1].Trim(),
                    TriggeredRules = System.Text.Json.JsonSerializer.Serialize(triggeredRules),
                    SelectedAction = parts[3].Trim(),
                    SuppressedActions = System.Text.Json.JsonSerializer.Serialize(suppressedActions),
                    Timestamp = DateTime.Parse(parts[5].Trim(), CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind)
                });
            }
        }

        if (decisions.Any())
        {
            await _context.Decisions.AddRangeAsync(decisions);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Loaded {Count} decisions from CSV", decisions.Count);
        }
    }

    private async Task LoadActionsAsync()
    {
        var filePath = Path.Combine(_seedDataPath, "actions.csv");
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("Actions CSV file not found at {Path}", filePath);
            return;
        }

        var existingCount = await _context.Actions.CountAsync();
        if (existingCount > 0)
        {
            _logger.LogInformation("Actions already exist in database, skipping CSV load");
            return;
        }

        var lines = await File.ReadAllLinesAsync(filePath);
        var actions = new List<UserAction>();

        foreach (var line in lines.Skip(1))
        {
            if (string.IsNullOrWhiteSpace(line)) continue;
            
            var parts = line.Split(',');
            if (parts.Length >= 4)
            {
                actions.Add(new UserAction
                {
                    ActionId = parts[0].Trim(),
                    UserId = parts[1].Trim(),
                    ActionType = parts[2].Trim(),
                    CreatedAt = DateTime.Parse(parts[3].Trim(), CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind)
                });
            }
        }

        if (actions.Any())
        {
            await _context.Actions.AddRangeAsync(actions);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Loaded {Count} actions from CSV", actions.Count);
        }
    }
}
