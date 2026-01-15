using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using NCalc;
using TurkcellDecisionEngine.Core.Entities;
using TurkcellDecisionEngine.Core.Interfaces;
using TurkcellDecisionEngine.Infrastructure.Data;

namespace TurkcellDecisionEngine.Infrastructure.Services;

public class RuleEngine : IRuleEngine
{
    private readonly AppDbContext _context;
    private readonly IRealtimeNotifier _realtimeNotifier;
    
    // Regex to match BETWEEN clauses: "field BETWEEN value1 AND value2"
    private static readonly Regex BetweenRegex = new(
        @"(\w+)\s+BETWEEN\s+(\d+(?:\.\d+)?)\s+AND\s+(\d+(?:\.\d+)?)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public RuleEngine(AppDbContext context, IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task<IEnumerable<Rule>> EvaluateRulesAsync(UserState userState)
    {
        var activeRules = await _context.Rules
            .Where(r => r.IsActive)
            .OrderBy(r => r.Priority)
            .ToListAsync();

        var triggeredRules = new List<Rule>();

        foreach (var rule in activeRules)
        {
            if (EvaluateCondition(rule.Condition, userState))
            {
                triggeredRules.Add(rule);
            }
        }

        return triggeredRules;
    }

    private bool EvaluateCondition(string condition, UserState state)
    {
        try
        {
            // First, convert BETWEEN clauses to NCalc-compatible format
            var processedCondition = ConvertBetweenClauses(condition);
            
            // Replace variable names with actual values
            var expression = processedCondition
                .Replace("internet_today_gb", state.InternetTodayGb.ToString(System.Globalization.CultureInfo.InvariantCulture))
                .Replace("spend_today_try", state.SpendTodayTry.ToString(System.Globalization.CultureInfo.InvariantCulture))
                .Replace("content_minutes_today", state.ContentMinutesToday.ToString())
                .Replace("&&", "and")
                .Replace("||", "or");

            var expr = new Expression(expression);
            var result = expr.Evaluate();
            
            return result is bool boolResult && boolResult;
        }
        catch (Exception)
        {
            // If evaluation fails, rule doesn't trigger
            return false;
        }
    }

    /// <summary>
    /// Converts BETWEEN clauses to NCalc-compatible format.
    /// Example: "internet_today_gb BETWEEN 10 AND 15" becomes "(internet_today_gb >= 10 and internet_today_gb <= 15)"
    /// </summary>
    private string ConvertBetweenClauses(string condition)
    {
        return BetweenRegex.Replace(condition, match =>
        {
            var field = match.Groups[1].Value;
            var lowerBound = match.Groups[2].Value;
            var upperBound = match.Groups[3].Value;
            
            return $"({field} >= {lowerBound} and {field} <= {upperBound})";
        });
    }

    public async Task<IEnumerable<Rule>> GetAllRulesAsync()
    {
        return await _context.Rules
            .OrderBy(r => r.Priority)
            .ToListAsync();
    }

    public async Task<Rule?> GetRuleByIdAsync(string ruleId)
    {
        return await _context.Rules.FindAsync(ruleId);
    }

    public async Task<Rule> CreateRuleAsync(Rule rule)
    {
        if (string.IsNullOrEmpty(rule.RuleId))
        {
            rule.RuleId = $"R-{DateTime.UtcNow.Ticks}";
        }

        _context.Rules.Add(rule);
        await _context.SaveChangesAsync();

        // Notify via SignalR
        await _realtimeNotifier.NotifyRuleChangedAsync(rule, "created");
        await _realtimeNotifier.NotifyDashboardUpdateAsync();

        return rule;
    }

    public async Task<Rule?> UpdateRuleAsync(string ruleId, Rule updatedRule)
    {
        var rule = await _context.Rules.FindAsync(ruleId);
        
        if (rule == null)
            return null;

        var wasToggled = rule.IsActive != updatedRule.IsActive;

        rule.Condition = updatedRule.Condition;
        rule.Action = updatedRule.Action;
        rule.Message = updatedRule.Message;
        rule.Priority = updatedRule.Priority;
        rule.IsActive = updatedRule.IsActive;

        await _context.SaveChangesAsync();

        // Notify via SignalR
        await _realtimeNotifier.NotifyRuleChangedAsync(rule, wasToggled ? "toggled" : "updated");
        await _realtimeNotifier.NotifyDashboardUpdateAsync();

        return rule;
    }

    public async Task<bool> DeleteRuleAsync(string ruleId)
    {
        var rule = await _context.Rules.FindAsync(ruleId);
        
        if (rule == null)
            return false;

        _context.Rules.Remove(rule);
        await _context.SaveChangesAsync();

        // Notify via SignalR
        await _realtimeNotifier.NotifyRuleChangedAsync(rule, "deleted");
        await _realtimeNotifier.NotifyDashboardUpdateAsync();

        return true;
    }
}
