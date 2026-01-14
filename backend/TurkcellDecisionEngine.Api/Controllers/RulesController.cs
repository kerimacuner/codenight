using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TurkcellDecisionEngine.Api.DTOs;
using TurkcellDecisionEngine.Core.Entities;
using TurkcellDecisionEngine.Core.Interfaces;

namespace TurkcellDecisionEngine.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Presenter")]
public class RulesController : ControllerBase
{
    private readonly IRuleEngine _ruleEngine;

    public RulesController(IRuleEngine ruleEngine)
    {
        _ruleEngine = ruleEngine;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RuleResponseDto>>> GetAllRules()
    {
        var rules = await _ruleEngine.GetAllRulesAsync();
        
        var result = rules.Select(r => new RuleResponseDto
        {
            RuleId = r.RuleId,
            Condition = r.Condition,
            Action = r.Action,
            Priority = r.Priority,
            IsActive = r.IsActive
        });

        return Ok(result);
    }

    [HttpGet("{ruleId}")]
    public async Task<ActionResult<RuleResponseDto>> GetRule(string ruleId)
    {
        var rule = await _ruleEngine.GetRuleByIdAsync(ruleId);
        
        if (rule == null)
        {
            return NotFound($"Rule {ruleId} not found");
        }

        return Ok(new RuleResponseDto
        {
            RuleId = rule.RuleId,
            Condition = rule.Condition,
            Action = rule.Action,
            Priority = rule.Priority,
            IsActive = rule.IsActive
        });
    }

    [HttpPost]
    public async Task<ActionResult<RuleResponseDto>> CreateRule([FromBody] CreateRuleDto dto)
    {
        var rule = new Rule
        {
            RuleId = dto.RuleId ?? string.Empty,
            Condition = dto.Condition,
            Action = dto.Action,
            Priority = dto.Priority,
            IsActive = dto.IsActive
        };

        var created = await _ruleEngine.CreateRuleAsync(rule);

        return CreatedAtAction(nameof(GetRule), new { ruleId = created.RuleId }, new RuleResponseDto
        {
            RuleId = created.RuleId,
            Condition = created.Condition,
            Action = created.Action,
            Priority = created.Priority,
            IsActive = created.IsActive
        });
    }

    [HttpPut("{ruleId}")]
    public async Task<ActionResult<RuleResponseDto>> UpdateRule(string ruleId, [FromBody] UpdateRuleDto dto)
    {
        var rule = new Rule
        {
            RuleId = ruleId,
            Condition = dto.Condition,
            Action = dto.Action,
            Priority = dto.Priority,
            IsActive = dto.IsActive
        };

        var updated = await _ruleEngine.UpdateRuleAsync(ruleId, rule);
        
        if (updated == null)
        {
            return NotFound($"Rule {ruleId} not found");
        }

        return Ok(new RuleResponseDto
        {
            RuleId = updated.RuleId,
            Condition = updated.Condition,
            Action = updated.Action,
            Priority = updated.Priority,
            IsActive = updated.IsActive
        });
    }

    [HttpDelete("{ruleId}")]
    public async Task<ActionResult> DeleteRule(string ruleId)
    {
        var deleted = await _ruleEngine.DeleteRuleAsync(ruleId);
        
        if (!deleted)
        {
            return NotFound($"Rule {ruleId} not found");
        }

        return NoContent();
    }

    [HttpPatch("{ruleId}/toggle")]
    public async Task<ActionResult<RuleResponseDto>> ToggleRule(string ruleId)
    {
        var rule = await _ruleEngine.GetRuleByIdAsync(ruleId);
        
        if (rule == null)
        {
            return NotFound($"Rule {ruleId} not found");
        }

        var updatedRule = new Rule
        {
            RuleId = ruleId,
            Condition = rule.Condition,
            Action = rule.Action,
            Priority = rule.Priority,
            IsActive = !rule.IsActive
        };

        var updated = await _ruleEngine.UpdateRuleAsync(ruleId, updatedRule);

        return Ok(new RuleResponseDto
        {
            RuleId = updated!.RuleId,
            Condition = updated.Condition,
            Action = updated.Action,
            Priority = updated.Priority,
            IsActive = updated.IsActive
        });
    }
}
