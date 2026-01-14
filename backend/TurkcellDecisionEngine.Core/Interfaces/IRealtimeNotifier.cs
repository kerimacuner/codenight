using TurkcellDecisionEngine.Core.Entities;

namespace TurkcellDecisionEngine.Core.Interfaces;

public interface IRealtimeNotifier
{
    Task NotifyEventCreatedAsync(Event evt);
    Task NotifyDecisionMadeAsync(Decision decision, string userId);
    Task NotifyUserStateChangedAsync(UserState state);
    Task NotifyRuleChangedAsync(Rule rule, string action);
    Task NotifyDashboardUpdateAsync();
}
