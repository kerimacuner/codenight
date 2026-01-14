using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TurkcellDecisionEngine.Api.DTOs;
using TurkcellDecisionEngine.Core.Interfaces;
using TurkcellDecisionEngine.Infrastructure.Data;

namespace TurkcellDecisionEngine.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Presenter")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEventProcessor _eventProcessor;
    private readonly IActionManager _actionManager;
    private readonly IRuleEngine _ruleEngine;

    public DashboardController(
        AppDbContext context, 
        IEventProcessor eventProcessor,
        IActionManager actionManager,
        IRuleEngine ruleEngine)
    {
        _context = context;
        _eventProcessor = eventProcessor;
        _actionManager = actionManager;
        _ruleEngine = ruleEngine;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary()
    {
        var today = DateTime.UtcNow.Date;

        // Get counts
        var totalUsers = await _context.Users.CountAsync();
        var eventsToday = await _context.Events.CountAsync(e => e.Timestamp.Date == today);
        var decisionsToday = await _context.Decisions.CountAsync(d => d.Timestamp.Date == today);
        var activeRules = await _context.Rules.CountAsync(r => r.IsActive);

        // Get action counts for today
        var actionCounts = await _context.Actions
            .Where(a => a.CreatedAt.Date == today)
            .GroupBy(a => a.ActionType)
            .Select(g => new { ActionType = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ActionType, x => x.Count);

        // Get risk level distribution
        var riskDistribution = await _context.UserStates
            .GroupBy(s => s.RiskLevel)
            .Select(g => new { RiskLevel = g.Key.ToString(), Count = g.Count() })
            .ToDictionaryAsync(x => x.RiskLevel, x => x.Count);

        // Get recent events
        var recentEvents = await _context.Events
            .Include(e => e.User)
            .OrderByDescending(e => e.Timestamp)
            .Take(10)
            .Select(e => new EventResponseDto
            {
                EventId = e.EventId,
                UserId = e.UserId,
                UserName = e.User != null ? e.User.Name : null,
                Service = e.Service,
                EventType = e.EventType,
                Value = e.Value,
                Unit = e.Unit,
                Timestamp = e.Timestamp
            })
            .ToListAsync();

        // Get recent decisions
        var recentDecisions = await _context.Decisions
            .Include(d => d.User)
            .OrderByDescending(d => d.Timestamp)
            .Take(10)
            .ToListAsync();

        var decisionDtos = recentDecisions.Select(d => new DecisionResponseDto
        {
            DecisionId = d.DecisionId,
            UserId = d.UserId,
            UserName = d.User?.Name,
            TriggeredRules = JsonSerializer.Deserialize<List<string>>(d.TriggeredRules) ?? new(),
            SelectedAction = d.SelectedAction,
            SuppressedActions = JsonSerializer.Deserialize<List<string>>(d.SuppressedActions) ?? new(),
            Timestamp = d.Timestamp
        }).ToList();

        return Ok(new DashboardSummaryDto
        {
            TotalUsers = totalUsers,
            TotalEventsToday = eventsToday,
            TotalDecisionsToday = decisionsToday,
            ActiveRules = activeRules,
            ActionCountsToday = actionCounts,
            RiskLevelDistribution = riskDistribution,
            RecentEvents = recentEvents,
            RecentDecisions = decisionDtos
        });
    }
}
