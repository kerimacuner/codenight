using TurkcellDecisionEngine.Core.Entities;

namespace TurkcellDecisionEngine.Core.Interfaces;

public interface IActionManager
{
    Task<(string SelectedAction, List<string> SuppressedActions)> SelectActionAsync(IEnumerable<Rule> triggeredRules);
    Task<Decision> CreateDecisionAsync(string userId, IEnumerable<Rule> triggeredRules, string selectedAction, List<string> suppressedActions);
    Task<IEnumerable<Decision>> GetDecisionsAsync(int count = 100);
    Task<IEnumerable<Decision>> GetDecisionsByUserAsync(string userId);
}
