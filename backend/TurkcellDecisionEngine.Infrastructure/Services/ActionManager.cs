using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TurkcellDecisionEngine.Core.Entities;
using TurkcellDecisionEngine.Core.Interfaces;
using TurkcellDecisionEngine.Infrastructure.Data;

namespace TurkcellDecisionEngine.Infrastructure.Services;

public class ActionManager : IActionManager
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public ActionManager(
        AppDbContext context, 
        INotificationService notificationService,
        IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _notificationService = notificationService;
        _realtimeNotifier = realtimeNotifier;
    }

    public Task<(string SelectedAction, List<string> SuppressedActions)> SelectActionAsync(IEnumerable<Rule> triggeredRules)
    {
        var rulesList = triggeredRules.OrderBy(r => r.Priority).ToList();
        
        if (!rulesList.Any())
        {
            return Task.FromResult((string.Empty, new List<string>()));
        }

        // Select the highest priority action (lowest priority number)
        var selectedAction = rulesList.First().Action;
        
        // All other actions are suppressed
        var suppressedActions = rulesList.Skip(1).Select(r => r.Action).Distinct().ToList();

        return Task.FromResult((selectedAction, suppressedActions));
    }

    public async Task<Decision> CreateDecisionAsync(string userId, IEnumerable<Rule> triggeredRules, string selectedAction, List<string> suppressedActions)
    {
        var rulesList = triggeredRules.OrderBy(r => r.Priority).ToList();
        var triggeredRuleIds = rulesList.Select(r => r.RuleId).ToList();

        // En yüksek öncelikli kuralın mesajını al
        var selectedRule = rulesList.FirstOrDefault();
        var message = selectedRule?.Message ?? GetNotificationMessage(selectedAction);

        var decision = new Decision
        {
            DecisionId = $"D-{DateTime.UtcNow.Ticks}",
            UserId = userId,
            TriggeredRules = JsonSerializer.Serialize(triggeredRuleIds),
            SelectedAction = selectedAction,
            SuppressedActions = JsonSerializer.Serialize(suppressedActions),
            Message = message,
            Timestamp = DateTime.UtcNow
        };

        // Load user for notification
        decision.User = await _context.Users.FindAsync(userId);

        _context.Decisions.Add(decision);

        // Create action record
        if (!string.IsNullOrEmpty(selectedAction))
        {
            var action = new UserAction
            {
                ActionId = $"A-{DateTime.UtcNow.Ticks}",
                UserId = userId,
                ActionType = selectedAction,
                CreatedAt = DateTime.UtcNow
            };
            _context.Actions.Add(action);

            // Send BiP notification
            await _notificationService.SendNotificationAsync(userId, selectedAction, message);
        }

        await _context.SaveChangesAsync();

        // Notify via SignalR
        await _realtimeNotifier.NotifyDecisionMadeAsync(decision, userId);
        await _realtimeNotifier.NotifyDashboardUpdateAsync();

        return decision;
    }

    public async Task<IEnumerable<Decision>> GetDecisionsAsync(int count = 100)
    {
        return await _context.Decisions
            .Include(d => d.User)
            .OrderByDescending(d => d.Timestamp)
            .Take(count)
            .ToListAsync();
    }

    public async Task<IEnumerable<Decision>> GetDecisionsByUserAsync(string userId)
    {
        return await _context.Decisions
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.Timestamp)
            .ToListAsync();
    }

    private string GetNotificationMessage(string actionType)
    {
        return actionType switch
        {
            "DATA_USAGE_WARNING" => "Günlük internet kullanımınız yüksek seviyeye ulaştı. Kalan kotanızı kontrol etmenizi öneririz.",
            "SPEND_ALERT" => "Bugünkü harcamalarınız belirlenen limiti aştı. Harcamalarınızı gözden geçirmenizi öneririz.",
            "CONTENT_SUGGESTION" => "Bugün yoğun içerik tüketimi yaptınız. Göz sağlığınız için ara vermenizi öneririz.",
            "CRITICAL_ALERT" => "Dikkat! Bugün internet ve harcama kullanımınız kritik seviyededir. Limitlerinizi kontrol etmenizi öneririz.",
            "DATA_USAGE_NUDGE" => "İnternet kullanımınız artıyor. Kotanızı takip etmeyi unutmayın.",
            "SPEND_NUDGE" => "Harcamalarınız orta seviyede. Bütçenizi gözden geçirmek isteyebilirsiniz.",
            "CONTENT_COOLDOWN_SUGGESTION" => "Uzun süredir içerik tüketiyorsunuz. Kısa bir mola vermenizi öneririz.",
            _ => "Turkcell size önemli bir bildirim göndermek istiyor."
        };
    }
}
