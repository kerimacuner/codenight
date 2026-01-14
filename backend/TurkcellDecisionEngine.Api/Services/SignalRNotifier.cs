using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using TurkcellDecisionEngine.Api.Hubs;
using TurkcellDecisionEngine.Core.Entities;
using TurkcellDecisionEngine.Core.Interfaces;

namespace TurkcellDecisionEngine.Api.Services;

public class SignalRNotifier : IRealtimeNotifier
{
    private readonly IHubContext<DecisionHub> _hubContext;
    private readonly ILogger<SignalRNotifier> _logger;

    public SignalRNotifier(IHubContext<DecisionHub> hubContext, ILogger<SignalRNotifier> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyEventCreatedAsync(Event evt)
    {
        var eventData = new
        {
            eventId = evt.EventId,
            userId = evt.UserId,
            userName = evt.User?.Name,
            service = evt.Service,
            eventType = evt.EventType,
            value = evt.Value,
            unit = evt.Unit,
            timestamp = evt.Timestamp
        };

        // Notify admins group
        await _hubContext.Clients.Group("admins").SendAsync("EventCreated", eventData);
        
        // Notify specific user
        await _hubContext.Clients.Group($"user-{evt.UserId}").SendAsync("EventCreated", eventData);

        _logger.LogInformation("SignalR: EventCreated notification sent for {EventId}", evt.EventId);
    }

    public async Task NotifyDecisionMadeAsync(Decision decision, string userId)
    {
        var decisionData = new
        {
            decisionId = decision.DecisionId,
            userId = decision.UserId,
            userName = decision.User?.Name,
            triggeredRules = JsonSerializer.Deserialize<List<string>>(decision.TriggeredRules) ?? new List<string>(),
            selectedAction = decision.SelectedAction,
            suppressedActions = JsonSerializer.Deserialize<List<string>>(decision.SuppressedActions) ?? new List<string>(),
            timestamp = decision.Timestamp
        };

        // Notify admins group
        await _hubContext.Clients.Group("admins").SendAsync("DecisionMade", decisionData);
        
        // Notify specific user
        await _hubContext.Clients.Group($"user-{userId}").SendAsync("DecisionMade", decisionData);

        _logger.LogInformation("SignalR: DecisionMade notification sent for {DecisionId}", decision.DecisionId);
    }

    public async Task NotifyUserStateChangedAsync(UserState state)
    {
        var stateData = new
        {
            userId = state.UserId,
            userName = state.User?.Name,
            city = state.User?.City,
            internetTodayGb = state.InternetTodayGb,
            spendTodayTry = state.SpendTodayTry,
            contentMinutesToday = state.ContentMinutesToday,
            riskLevel = state.RiskLevel.ToString(),
            lastUpdated = state.LastUpdated
        };

        // Notify admins group
        await _hubContext.Clients.Group("admins").SendAsync("UserStateChanged", stateData);
        
        // Notify specific user
        await _hubContext.Clients.Group($"user-{state.UserId}").SendAsync("UserStateChanged", stateData);

        _logger.LogInformation("SignalR: UserStateChanged notification sent for {UserId}", state.UserId);
    }

    public async Task NotifyRuleChangedAsync(Rule rule, string action)
    {
        var ruleData = new
        {
            ruleId = rule.RuleId,
            condition = rule.Condition,
            action = rule.Action,
            priority = rule.Priority,
            isActive = rule.IsActive,
            changeType = action // "created", "updated", "deleted", "toggled"
        };

        // Notify admins group only
        await _hubContext.Clients.Group("admins").SendAsync("RuleChanged", ruleData);

        _logger.LogInformation("SignalR: RuleChanged notification sent for {RuleId} ({Action})", rule.RuleId, action);
    }

    public async Task NotifyDashboardUpdateAsync()
    {
        // Notify admins group to refresh dashboard
        await _hubContext.Clients.Group("admins").SendAsync("DashboardUpdate");

        _logger.LogInformation("SignalR: DashboardUpdate notification sent");
    }
}
