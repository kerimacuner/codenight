using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TurkcellDecisionEngine.Api.DTOs;
using TurkcellDecisionEngine.Core.Interfaces;

namespace TurkcellDecisionEngine.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DecisionsController : ControllerBase
{
    private readonly IActionManager _actionManager;

    public DecisionsController(IActionManager actionManager)
    {
        _actionManager = actionManager;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Presenter")]
    public async Task<ActionResult<IEnumerable<DecisionResponseDto>>> GetDecisions([FromQuery] int count = 100)
    {
        var decisions = await _actionManager.GetDecisionsAsync(count);
        
        var result = decisions.Select(d => new DecisionResponseDto
        {
            DecisionId = d.DecisionId,
            UserId = d.UserId,
            UserName = d.User?.Name,
            TriggeredRules = JsonSerializer.Deserialize<List<string>>(d.TriggeredRules) ?? new(),
            SelectedAction = d.SelectedAction,
            SuppressedActions = JsonSerializer.Deserialize<List<string>>(d.SuppressedActions) ?? new(),
            Timestamp = d.Timestamp
        });

        return Ok(result);
    }

    [HttpGet("user/{userId}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<DecisionResponseDto>>> GetDecisionsByUser(string userId)
    {
        // Users can only view their own decisions
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        
        if (role != "Admin" && role != "Presenter" && currentUserId != userId)
        {
            return Forbid();
        }

        var decisions = await _actionManager.GetDecisionsByUserAsync(userId);
        
        var result = decisions.Select(d => new DecisionResponseDto
        {
            DecisionId = d.DecisionId,
            UserId = d.UserId,
            TriggeredRules = JsonSerializer.Deserialize<List<string>>(d.TriggeredRules) ?? new(),
            SelectedAction = d.SelectedAction,
            SuppressedActions = JsonSerializer.Deserialize<List<string>>(d.SuppressedActions) ?? new(),
            Timestamp = d.Timestamp
        });

        return Ok(result);
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<DecisionResponseDto>>> GetMyDecisions()
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(currentUserId))
        {
            return Unauthorized();
        }

        var decisions = await _actionManager.GetDecisionsByUserAsync(currentUserId);
        
        var result = decisions.Select(d => new DecisionResponseDto
        {
            DecisionId = d.DecisionId,
            UserId = d.UserId,
            TriggeredRules = JsonSerializer.Deserialize<List<string>>(d.TriggeredRules) ?? new(),
            SelectedAction = d.SelectedAction,
            SuppressedActions = JsonSerializer.Deserialize<List<string>>(d.SuppressedActions) ?? new(),
            Timestamp = d.Timestamp
        });

        return Ok(result);
    }
}
