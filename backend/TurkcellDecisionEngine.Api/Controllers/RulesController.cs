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
    private readonly ILlmService _llmService;
    private readonly ILogger<RulesController> _logger;

    public RulesController(IRuleEngine ruleEngine, ILlmService llmService, ILogger<RulesController> logger)
    {
        _ruleEngine = ruleEngine;
        _llmService = llmService;
        _logger = logger;
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
            Message = r.Message,
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
            Message = rule.Message,
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
            Message = dto.Message,
            Priority = dto.Priority,
            IsActive = dto.IsActive
        };

        var created = await _ruleEngine.CreateRuleAsync(rule);

        return CreatedAtAction(nameof(GetRule), new { ruleId = created.RuleId }, new RuleResponseDto
        {
            RuleId = created.RuleId,
            Condition = created.Condition,
            Action = created.Action,
            Message = created.Message,
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
            Message = dto.Message,
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
            Message = updated.Message,
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
            Message = rule.Message,
            Priority = rule.Priority,
            IsActive = !rule.IsActive
        };

        var updated = await _ruleEngine.UpdateRuleAsync(ruleId, updatedRule);

        return Ok(new RuleResponseDto
        {
            RuleId = updated!.RuleId,
            Condition = updated.Condition,
            Action = updated.Action,
            Message = updated.Message,
            Priority = updated.Priority,
            IsActive = updated.IsActive
        });
    }

    /// <summary>
    /// Doğal dil açıklamasından AI ile kural oluşturur
    /// </summary>
    [HttpPost("generate")]
    public async Task<ActionResult<GenerateRuleResponse>> GenerateRule([FromBody] GenerateRuleRequest request)
    {
        try
        {
            _logger.LogInformation("Generating rule from prompt: {Prompt}", request.Prompt);
            
            var generatedRule = await _llmService.GenerateRuleFromNaturalLanguageAsync(request.Prompt);

            return Ok(new GenerateRuleResponse
            {
                Condition = generatedRule.Condition,
                Action = generatedRule.Action,
                Message = generatedRule.Message,
                Explanation = generatedRule.Explanation
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation while generating rule");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating rule from natural language");
            return StatusCode(500, new { error = "Kural oluşturulurken bir hata oluştu. Lütfen tekrar deneyin." });
        }
    }
}
