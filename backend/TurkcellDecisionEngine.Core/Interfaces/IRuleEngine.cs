using TurkcellDecisionEngine.Core.Entities;

namespace TurkcellDecisionEngine.Core.Interfaces;

public interface IRuleEngine
{
    Task<IEnumerable<Rule>> EvaluateRulesAsync(UserState userState);
    Task<IEnumerable<Rule>> GetAllRulesAsync();
    Task<Rule?> GetRuleByIdAsync(string ruleId);
    Task<Rule> CreateRuleAsync(Rule rule);
    Task<Rule?> UpdateRuleAsync(string ruleId, Rule rule);
    Task<bool> DeleteRuleAsync(string ruleId);
}
