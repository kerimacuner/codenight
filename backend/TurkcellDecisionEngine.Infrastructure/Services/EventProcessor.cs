using Microsoft.EntityFrameworkCore;
using TurkcellDecisionEngine.Core.Entities;
using TurkcellDecisionEngine.Core.Interfaces;
using TurkcellDecisionEngine.Infrastructure.Data;

namespace TurkcellDecisionEngine.Infrastructure.Services;

public class EventProcessor : IEventProcessor
{
    private readonly AppDbContext _context;
    private readonly IUserStateManager _userStateManager;
    private readonly IRuleEngine _ruleEngine;
    private readonly IActionManager _actionManager;

    public EventProcessor(
        AppDbContext context,
        IUserStateManager userStateManager,
        IRuleEngine ruleEngine,
        IActionManager actionManager)
    {
        _context = context;
        _userStateManager = userStateManager;
        _ruleEngine = ruleEngine;
        _actionManager = actionManager;
    }

    public async Task<Decision?> ProcessEventAsync(Event evt)
    {
        // Generate event ID if not provided
        if (string.IsNullOrEmpty(evt.EventId))
        {
            evt.EventId = $"EVT-{DateTime.UtcNow.Ticks}";
        }

        // Set timestamp if not provided
        if (evt.Timestamp == default)
        {
            evt.Timestamp = DateTime.UtcNow;
        }

        // Ensure user exists
        var user = await _context.Users.FindAsync(evt.UserId);
        if (user == null)
        {
            user = new User
            {
                UserId = evt.UserId,
                Name = $"User {evt.UserId}",
                City = "Unknown"
            };
            _context.Users.Add(user);
        }

        // Save the event
        _context.Events.Add(evt);
        await _context.SaveChangesAsync();

        // Update user state
        var userState = await _userStateManager.UpdateUserStateAsync(evt.UserId, evt);

        // Evaluate rules
        var triggeredRules = await _ruleEngine.EvaluateRulesAsync(userState);
        var triggeredRulesList = triggeredRules.ToList();

        if (!triggeredRulesList.Any())
        {
            return null;
        }

        // Select action and create decision
        var (selectedAction, suppressedActions) = await _actionManager.SelectActionAsync(triggeredRulesList);
        var decision = await _actionManager.CreateDecisionAsync(
            evt.UserId,
            triggeredRulesList,
            selectedAction,
            suppressedActions);

        return decision;
    }

    public async Task<IEnumerable<Event>> GetRecentEventsAsync(int count = 50)
    {
        return await _context.Events
            .Include(e => e.User)
            .OrderByDescending(e => e.Timestamp)
            .Take(count)
            .ToListAsync();
    }

    public async Task<IEnumerable<Event>> GetEventsByUserAsync(string userId)
    {
        return await _context.Events
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync();
    }
}
