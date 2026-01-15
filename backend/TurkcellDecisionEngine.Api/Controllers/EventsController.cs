using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TurkcellDecisionEngine.Api.DTOs;
using TurkcellDecisionEngine.Core.Entities;
using TurkcellDecisionEngine.Core.Interfaces;

namespace TurkcellDecisionEngine.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly IEventProcessor _eventProcessor;
    private readonly IUserStateManager _userStateManager;

    public EventsController(IEventProcessor eventProcessor, IUserStateManager userStateManager)
    {
        _eventProcessor = eventProcessor;
        _userStateManager = userStateManager;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Presenter")]
    public async Task<ActionResult<ProcessEventResultDto>> CreateEvent([FromBody] CreateEventDto dto)
    {
        var evt = new Event
        {
            EventId = dto.EventId ?? string.Empty,
            UserId = dto.UserId,
            Service = dto.Service,
            EventType = dto.EventType,
            Value = dto.Value,
            Unit = dto.Unit,
            Timestamp = dto.Timestamp ?? DateTime.UtcNow
        };

        var decision = await _eventProcessor.ProcessEventAsync(evt);
        var userState = await _userStateManager.GetOrCreateUserStateAsync(dto.UserId);

        var result = new ProcessEventResultDto
        {
            Event = new EventResponseDto
            {
                EventId = evt.EventId,
                UserId = evt.UserId,
                Service = evt.Service,
                EventType = evt.EventType,
                Value = evt.Value,
                Unit = evt.Unit,
                Timestamp = evt.Timestamp
            },
            UserState = new UserStateResponseDto
            {
                UserId = userState.UserId,
                InternetTodayGb = userState.InternetTodayGb,
                SpendTodayTry = userState.SpendTodayTry,
                ContentMinutesToday = userState.ContentMinutesToday,
                RiskLevel = userState.RiskLevel.ToString(),
                LastUpdated = userState.LastUpdated
            }
        };

        if (decision != null)
        {
            result.Decision = new DecisionResponseDto
            {
                DecisionId = decision.DecisionId,
                UserId = decision.UserId,
                TriggeredRules = JsonSerializer.Deserialize<List<string>>(decision.TriggeredRules) ?? new(),
                SelectedAction = decision.SelectedAction,
                SuppressedActions = JsonSerializer.Deserialize<List<string>>(decision.SuppressedActions) ?? new(),
                Message = decision.Message,
                Timestamp = decision.Timestamp
            };
        }

        return Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Presenter")]
    public async Task<ActionResult<IEnumerable<EventResponseDto>>> GetRecentEvents([FromQuery] int count = 50)
    {
        var events = await _eventProcessor.GetRecentEventsAsync(count);
        
        var result = events.Select(e => new EventResponseDto
        {
            EventId = e.EventId,
            UserId = e.UserId,
            UserName = e.User?.Name,
            Service = e.Service,
            EventType = e.EventType,
            Value = e.Value,
            Unit = e.Unit,
            Timestamp = e.Timestamp
        });

        return Ok(result);
    }

    [HttpGet("user/{userId}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<EventResponseDto>>> GetEventsByUser(string userId)
    {
        // Users can only view their own events
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        
        if (role != "Admin" && role != "Presenter" && currentUserId != userId)
        {
            return Forbid();
        }

        var events = await _eventProcessor.GetEventsByUserAsync(userId);
        
        var result = events.Select(e => new EventResponseDto
        {
            EventId = e.EventId,
            UserId = e.UserId,
            Service = e.Service,
            EventType = e.EventType,
            Value = e.Value,
            Unit = e.Unit,
            Timestamp = e.Timestamp
        });

        return Ok(result);
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<EventResponseDto>>> GetMyEvents()
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(currentUserId))
        {
            return Unauthorized();
        }

        var events = await _eventProcessor.GetEventsByUserAsync(currentUserId);
        
        var result = events.Select(e => new EventResponseDto
        {
            EventId = e.EventId,
            UserId = e.UserId,
            Service = e.Service,
            EventType = e.EventType,
            Value = e.Value,
            Unit = e.Unit,
            Timestamp = e.Timestamp
        });

        return Ok(result);
    }
}
