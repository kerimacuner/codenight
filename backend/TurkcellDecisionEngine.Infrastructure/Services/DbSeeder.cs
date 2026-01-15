using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TurkcellDecisionEngine.Core.Entities;
using TurkcellDecisionEngine.Core.Enums;
using TurkcellDecisionEngine.Infrastructure.Data;

namespace TurkcellDecisionEngine.Infrastructure.Services;

public class DbSeeder
{
    private readonly AppDbContext _context;
    private readonly ILogger<DbSeeder> _logger;

    public DbSeeder(AppDbContext context, ILogger<DbSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        _logger.LogInformation("Starting database seeding...");

        await SeedUsersAsync();
        await SeedUserStatesAsync();
        await SeedRulesAsync();
        await SeedEventsAsync();
        await SeedDecisionsAsync();
        await SeedActionsAsync();

        _logger.LogInformation("Database seeding completed successfully");
    }

    private async Task SeedUsersAsync()
    {
        if (await _context.Users.AnyAsync())
        {
            _logger.LogInformation("Users already exist, skipping seed");
            return;
        }

        var users = new List<User>
        {
            // Admin user
            new User
            {
                UserId = "admin",
                Name = "Admin Kullanıcı",
                City = "Istanbul",
                Email = "admin@turkcell.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = UserRole.Admin
            },
            // Presenter user
            new User
            {
                UserId = "presenter",
                Name = "Sunum Yöneticisi",
                City = "Istanbul",
                Email = "presenter@turkcell.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("presenter123"),
                Role = UserRole.Presenter
            },
            // Regular users
            new User { UserId = "U1", Name = "Ayşe Yılmaz", City = "Istanbul", Email = "ayse@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Role = UserRole.User },
            new User { UserId = "U2", Name = "Ali Kaya", City = "Ankara", Email = "ali@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Role = UserRole.User },
            new User { UserId = "U3", Name = "Deniz Demir", City = "Izmir", Email = "deniz@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Role = UserRole.User },
            new User { UserId = "U4", Name = "Mert Çelik", City = "Bursa", Email = "mert@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Role = UserRole.User },
            new User { UserId = "U5", Name = "Ece Öztürk", City = "Antalya", Email = "ece@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Role = UserRole.User },
            new User { UserId = "U6", Name = "Burak Şahin", City = "Istanbul", Email = "burak@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Role = UserRole.User },
            new User { UserId = "U7", Name = "Zeynep Aydın", City = "Ankara", Email = "zeynep@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Role = UserRole.User },
            new User { UserId = "U8", Name = "Emre Koç", City = "Izmir", Email = "emre@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Role = UserRole.User },
            new User { UserId = "U9", Name = "Selin Arslan", City = "Bursa", Email = "selin@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Role = UserRole.User },
            new User { UserId = "U10", Name = "Can Yıldız", City = "Antalya", Email = "can@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Role = UserRole.User },
        };

        await _context.Users.AddRangeAsync(users);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} users", users.Count);
    }

    private async Task SeedUserStatesAsync()
    {
        if (await _context.UserStates.AnyAsync())
        {
            _logger.LogInformation("User states already exist, skipping seed");
            return;
        }

        var states = new List<UserState>
        {
            new UserState { UserId = "admin", InternetTodayGb = 0, SpendTodayTry = 0, ContentMinutesToday = 0, RiskLevel = RiskLevel.LOW, LastUpdated = DateTime.UtcNow },
            new UserState { UserId = "presenter", InternetTodayGb = 0, SpendTodayTry = 0, ContentMinutesToday = 0, RiskLevel = RiskLevel.LOW, LastUpdated = DateTime.UtcNow },
            new UserState { UserId = "U1", InternetTodayGb = 15.5m, SpendTodayTry = 140, ContentMinutesToday = 125, RiskLevel = RiskLevel.HIGH, LastUpdated = DateTime.UtcNow },
            new UserState { UserId = "U2", InternetTodayGb = 7.2m, SpendTodayTry = 380, ContentMinutesToday = 90, RiskLevel = RiskLevel.HIGH, LastUpdated = DateTime.UtcNow },
            new UserState { UserId = "U3", InternetTodayGb = 5.0m, SpendTodayTry = 0, ContentMinutesToday = 310, RiskLevel = RiskLevel.HIGH, LastUpdated = DateTime.UtcNow },
            new UserState { UserId = "U4", InternetTodayGb = 9.8m, SpendTodayTry = 90, ContentMinutesToday = 45, RiskLevel = RiskLevel.LOW, LastUpdated = DateTime.UtcNow },
            new UserState { UserId = "U5", InternetTodayGb = 17.3m, SpendTodayTry = 420, ContentMinutesToday = 40, RiskLevel = RiskLevel.CRITICAL, LastUpdated = DateTime.UtcNow },
            new UserState { UserId = "U6", InternetTodayGb = 3.2m, SpendTodayTry = 50, ContentMinutesToday = 30, RiskLevel = RiskLevel.LOW, LastUpdated = DateTime.UtcNow },
            new UserState { UserId = "U7", InternetTodayGb = 17.3m, SpendTodayTry = 180, ContentMinutesToday = 120, RiskLevel = RiskLevel.HIGH, LastUpdated = DateTime.UtcNow },
            new UserState { UserId = "U8", InternetTodayGb = 18.5m, SpendTodayTry = 350, ContentMinutesToday = 260, RiskLevel = RiskLevel.CRITICAL, LastUpdated = DateTime.UtcNow },
            new UserState { UserId = "U9", InternetTodayGb = 27.0m, SpendTodayTry = 450, ContentMinutesToday = 330, RiskLevel = RiskLevel.CRITICAL, LastUpdated = DateTime.UtcNow },
            new UserState { UserId = "U10", InternetTodayGb = 11.0m, SpendTodayTry = 240, ContentMinutesToday = 175, RiskLevel = RiskLevel.MEDIUM, LastUpdated = DateTime.UtcNow },
        };

        await _context.UserStates.AddRangeAsync(states);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} user states", states.Count);
    }

    private async Task SeedRulesAsync()
    {
        if (await _context.Rules.AnyAsync())
        {
            _logger.LogInformation("Rules already exist, skipping seed");
            return;
        }

        var rules = new List<Rule>
        {
            new Rule { RuleId = "R-01", Condition = "internet_today_gb > 15", Action = "DATA_USAGE_WARNING", Message = "Günlük internet kullanımınız yüksek seviyeye ulaştı. Kotanızı kontrol etmenizi öneririz.", Priority = 3, IsActive = true },
            new Rule { RuleId = "R-02", Condition = "spend_today_try > 300", Action = "SPEND_ALERT", Message = "Günlük harcama limitinize yaklaşıyorsunuz. Harcamalarınızı gözden geçirin.", Priority = 2, IsActive = true },
            new Rule { RuleId = "R-03", Condition = "content_minutes_today > 180", Action = "CONTENT_SUGGESTION", Message = "Bugün çok fazla içerik tükettiniz. Bir mola vermeyi düşünebilirsiniz.", Priority = 4, IsActive = true },
            new Rule { RuleId = "R-04", Condition = "internet_today_gb > 15 && spend_today_try > 300", Action = "CRITICAL_ALERT", Message = "⚠️ Dikkat! İnternet kotası ve harcama limitinizi aştınız. Acil müdahale gerekebilir.", Priority = 1, IsActive = true },
            new Rule { RuleId = "R-05", Condition = "internet_today_gb BETWEEN 10 AND 15", Action = "DATA_USAGE_NUDGE", Message = "İnternet kullanımınız artıyor. Kota durumunuzu takip edin.", Priority = 5, IsActive = true },
            new Rule { RuleId = "R-06", Condition = "spend_today_try BETWEEN 200 AND 300", Action = "SPEND_NUDGE", Message = "Harcamalarınız artmaya başladı. Bütçenizi gözden geçirin.", Priority = 5, IsActive = true },
        };

        await _context.Rules.AddRangeAsync(rules);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} rules", rules.Count);
    }

    private async Task SeedEventsAsync()
    {
        if (await _context.Events.AnyAsync())
        {
            _logger.LogInformation("Events already exist, skipping seed");
            return;
        }

        var baseTime = DateTime.UtcNow.AddHours(-5);
        var events = new List<Event>
        {
            // Internet usage events
            new Event { EventId = "EVT-001", UserId = "U1", Service = "Superonline", EventType = "DATA_USAGE", Value = 5.2m, Unit = "GB", Timestamp = baseTime },
            new Event { EventId = "EVT-002", UserId = "U1", Service = "Superonline", EventType = "DATA_USAGE", Value = 10.3m, Unit = "GB", Timestamp = baseTime.AddMinutes(30) },
            new Event { EventId = "EVT-003", UserId = "U2", Service = "Superonline", EventType = "DATA_USAGE", Value = 7.2m, Unit = "GB", Timestamp = baseTime.AddMinutes(45) },
            new Event { EventId = "EVT-004", UserId = "U5", Service = "Superonline", EventType = "DATA_USAGE", Value = 17.3m, Unit = "GB", Timestamp = baseTime.AddHours(1) },
            new Event { EventId = "EVT-005", UserId = "U7", Service = "Superonline", EventType = "DATA_USAGE", Value = 17.3m, Unit = "GB", Timestamp = baseTime.AddHours(1.5) },
            new Event { EventId = "EVT-006", UserId = "U8", Service = "Superonline", EventType = "DATA_USAGE", Value = 18.5m, Unit = "GB", Timestamp = baseTime.AddHours(2) },
            new Event { EventId = "EVT-007", UserId = "U9", Service = "Superonline", EventType = "DATA_USAGE", Value = 27.0m, Unit = "GB", Timestamp = baseTime.AddHours(2.5) },
            
            // Payment events
            new Event { EventId = "EVT-010", UserId = "U2", Service = "Paycell", EventType = "PAYMENT", Value = 380, Unit = "TRY", Timestamp = baseTime.AddMinutes(60) },
            new Event { EventId = "EVT-011", UserId = "U5", Service = "Paycell", EventType = "PAYMENT", Value = 420, Unit = "TRY", Timestamp = baseTime.AddMinutes(90) },
            new Event { EventId = "EVT-012", UserId = "U8", Service = "Paycell", EventType = "PAYMENT", Value = 350, Unit = "TRY", Timestamp = baseTime.AddMinutes(120) },
            new Event { EventId = "EVT-013", UserId = "U9", Service = "Paycell", EventType = "PAYMENT", Value = 450, Unit = "TRY", Timestamp = baseTime.AddMinutes(150) },
            new Event { EventId = "EVT-014", UserId = "U10", Service = "Paycell", EventType = "PAYMENT", Value = 240, Unit = "TRY", Timestamp = baseTime.AddMinutes(180) },
            
            // Content streaming events
            new Event { EventId = "EVT-020", UserId = "U1", Service = "TV+", EventType = "STREAMING", Value = 60, Unit = "MIN", Timestamp = baseTime.AddHours(1) },
            new Event { EventId = "EVT-021", UserId = "U1", Service = "Fizy", EventType = "STREAMING", Value = 65, Unit = "MIN", Timestamp = baseTime.AddHours(2) },
            new Event { EventId = "EVT-022", UserId = "U3", Service = "TV+", EventType = "STREAMING", Value = 180, Unit = "MIN", Timestamp = baseTime.AddHours(1.5) },
            new Event { EventId = "EVT-023", UserId = "U3", Service = "BiPLive", EventType = "STREAMING", Value = 130, Unit = "MIN", Timestamp = baseTime.AddHours(3) },
            new Event { EventId = "EVT-024", UserId = "U8", Service = "Game+", EventType = "STREAMING", Value = 260, Unit = "MIN", Timestamp = baseTime.AddHours(2.5) },
            new Event { EventId = "EVT-025", UserId = "U9", Service = "TV+", EventType = "STREAMING", Value = 200, Unit = "MIN", Timestamp = baseTime.AddHours(3) },
            new Event { EventId = "EVT-026", UserId = "U9", Service = "Fizy", EventType = "STREAMING", Value = 130, Unit = "MIN", Timestamp = baseTime.AddHours(4) },
            new Event { EventId = "EVT-027", UserId = "U10", Service = "TV+", EventType = "STREAMING", Value = 175, Unit = "MIN", Timestamp = baseTime.AddHours(3.5) },
        };

        await _context.Events.AddRangeAsync(events);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} events", events.Count);
    }

    private async Task SeedDecisionsAsync()
    {
        if (await _context.Decisions.AnyAsync())
        {
            _logger.LogInformation("Decisions already exist, skipping seed");
            return;
        }

        var baseTime = DateTime.UtcNow.AddHours(-4);
        var decisions = new List<Decision>
        {
            new Decision { DecisionId = "D-001", UserId = "U1", TriggeredRules = "[\"R-01\"]", SelectedAction = "DATA_USAGE_WARNING", SuppressedActions = "[]", Message = "Günlük internet kullanımınız yüksek seviyeye ulaştı. Kotanızı kontrol etmenizi öneririz.", Timestamp = baseTime },
            new Decision { DecisionId = "D-002", UserId = "U2", TriggeredRules = "[\"R-02\"]", SelectedAction = "SPEND_ALERT", SuppressedActions = "[]", Message = "Günlük harcama limitinize yaklaşıyorsunuz. Harcamalarınızı gözden geçirin.", Timestamp = baseTime.AddMinutes(15) },
            new Decision { DecisionId = "D-003", UserId = "U3", TriggeredRules = "[\"R-03\"]", SelectedAction = "CONTENT_SUGGESTION", SuppressedActions = "[]", Message = "Bugün çok fazla içerik tükettiniz. Bir mola vermeyi düşünebilirsiniz.", Timestamp = baseTime.AddMinutes(30) },
            new Decision { DecisionId = "D-004", UserId = "U5", TriggeredRules = "[\"R-01\",\"R-02\",\"R-04\"]", SelectedAction = "CRITICAL_ALERT", SuppressedActions = "[\"DATA_USAGE_WARNING\",\"SPEND_ALERT\"]", Message = "⚠️ Dikkat! İnternet kotası ve harcama limitinizi aştınız. Acil müdahale gerekebilir.", Timestamp = baseTime.AddMinutes(45) },
            new Decision { DecisionId = "D-005", UserId = "U8", TriggeredRules = "[\"R-01\",\"R-02\",\"R-03\",\"R-04\"]", SelectedAction = "CRITICAL_ALERT", SuppressedActions = "[\"DATA_USAGE_WARNING\",\"SPEND_ALERT\",\"CONTENT_SUGGESTION\"]", Message = "⚠️ Dikkat! İnternet kotası ve harcama limitinizi aştınız. Acil müdahale gerekebilir.", Timestamp = baseTime.AddHours(1) },
            new Decision { DecisionId = "D-006", UserId = "U9", TriggeredRules = "[\"R-01\",\"R-02\",\"R-03\",\"R-04\"]", SelectedAction = "CRITICAL_ALERT", SuppressedActions = "[\"DATA_USAGE_WARNING\",\"SPEND_ALERT\",\"CONTENT_SUGGESTION\"]", Message = "⚠️ Dikkat! İnternet kotası ve harcama limitinizi aştınız. Acil müdahale gerekebilir.", Timestamp = baseTime.AddHours(1.5) },
            new Decision { DecisionId = "D-007", UserId = "U7", TriggeredRules = "[\"R-01\"]", SelectedAction = "DATA_USAGE_WARNING", SuppressedActions = "[]", Message = "Günlük internet kullanımınız yüksek seviyeye ulaştı. Kotanızı kontrol etmenizi öneririz.", Timestamp = baseTime.AddHours(2) },
            new Decision { DecisionId = "D-008", UserId = "U10", TriggeredRules = "[\"R-05\",\"R-06\"]", SelectedAction = "DATA_USAGE_NUDGE", SuppressedActions = "[\"SPEND_NUDGE\"]", Message = "İnternet kullanımınız artıyor. Kota durumunuzu takip edin.", Timestamp = baseTime.AddHours(2.5) },
        };

        await _context.Decisions.AddRangeAsync(decisions);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} decisions", decisions.Count);
    }

    private async Task SeedActionsAsync()
    {
        if (await _context.Actions.AnyAsync())
        {
            _logger.LogInformation("Actions already exist, skipping seed");
            return;
        }

        var baseTime = DateTime.UtcNow.AddHours(-4);
        var actions = new List<UserAction>
        {
            new UserAction { ActionId = "A-001", UserId = "U1", ActionType = "DATA_USAGE_WARNING", CreatedAt = baseTime },
            new UserAction { ActionId = "A-002", UserId = "U2", ActionType = "SPEND_ALERT", CreatedAt = baseTime.AddMinutes(15) },
            new UserAction { ActionId = "A-003", UserId = "U3", ActionType = "CONTENT_SUGGESTION", CreatedAt = baseTime.AddMinutes(30) },
            new UserAction { ActionId = "A-004", UserId = "U5", ActionType = "CRITICAL_ALERT", CreatedAt = baseTime.AddMinutes(45) },
            new UserAction { ActionId = "A-005", UserId = "U8", ActionType = "CRITICAL_ALERT", CreatedAt = baseTime.AddHours(1) },
            new UserAction { ActionId = "A-006", UserId = "U9", ActionType = "CRITICAL_ALERT", CreatedAt = baseTime.AddHours(1.5) },
            new UserAction { ActionId = "A-007", UserId = "U7", ActionType = "DATA_USAGE_WARNING", CreatedAt = baseTime.AddHours(2) },
            new UserAction { ActionId = "A-008", UserId = "U10", ActionType = "DATA_USAGE_NUDGE", CreatedAt = baseTime.AddHours(2.5) },
        };

        await _context.Actions.AddRangeAsync(actions);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} actions", actions.Count);
    }
}
