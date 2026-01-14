using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurkcellDecisionEngine.Api.DTOs;
using TurkcellDecisionEngine.Core.Entities;
using TurkcellDecisionEngine.Core.Enums;
using TurkcellDecisionEngine.Core.Interfaces;
using TurkcellDecisionEngine.Infrastructure.Data;

namespace TurkcellDecisionEngine.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IUserStateManager _userStateManager;
    private readonly IAuthService _authService;

    public UsersController(AppDbContext context, IUserStateManager userStateManager, IAuthService authService)
    {
        _context = context;
        _userStateManager = userStateManager;
        _authService = authService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Presenter")]
    public async Task<ActionResult<IEnumerable<UserStateResponseDto>>> GetAllUsers()
    {
        var states = await _userStateManager.GetAllUserStatesAsync();
        
        var result = states.Select(s => new UserStateResponseDto
        {
            UserId = s.UserId,
            UserName = s.User?.Name,
            City = s.User?.City,
            InternetTodayGb = s.InternetTodayGb,
            SpendTodayTry = s.SpendTodayTry,
            ContentMinutesToday = s.ContentMinutesToday,
            RiskLevel = s.RiskLevel.ToString(),
            LastUpdated = s.LastUpdated
        });

        return Ok(result);
    }

    [HttpGet("list")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<UserInfoDto>>> GetUsersList()
    {
        var users = await _context.Users.ToListAsync();
        
        var result = users.Select(u => new UserInfoDto
        {
            UserId = u.UserId,
            Name = u.Name,
            City = u.City,
            Email = u.Email,
            Role = u.Role.ToString()
        });

        return Ok(result);
    }

    [HttpGet("{id}/state")]
    [Authorize]
    public async Task<ActionResult<UserStateResponseDto>> GetUserState(string id)
    {
        // Users can only view their own state, Admin/Presenter can view all
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        
        if (role != "Admin" && role != "Presenter" && currentUserId != id)
        {
            return Forbid();
        }

        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound($"User {id} not found");
        }

        var state = await _userStateManager.GetOrCreateUserStateAsync(id);
        
        return Ok(new UserStateResponseDto
        {
            UserId = state.UserId,
            UserName = user.Name,
            City = user.City,
            InternetTodayGb = state.InternetTodayGb,
            SpendTodayTry = state.SpendTodayTry,
            ContentMinutesToday = state.ContentMinutesToday,
            RiskLevel = state.RiskLevel.ToString(),
            LastUpdated = state.LastUpdated
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserInfoDto>> CreateUser([FromBody] CreateUserDto dto)
    {
        var existingUser = await _context.Users.FindAsync(dto.UserId);
        if (existingUser != null)
        {
            return Conflict($"User {dto.UserId} already exists");
        }

        var role = dto.Role.ToUpperInvariant() switch
        {
            "ADMIN" => UserRole.Admin,
            "PRESENTER" => UserRole.Presenter,
            _ => UserRole.User
        };

        var user = new User
        {
            UserId = dto.UserId,
            Name = dto.Name,
            City = dto.City,
            Email = dto.Email,
            PasswordHash = _authService.HashPassword(dto.Password),
            Role = role
        };

        _context.Users.Add(user);

        // Create initial user state
        var userState = new UserState
        {
            UserId = dto.UserId,
            InternetTodayGb = 0,
            SpendTodayTry = 0,
            ContentMinutesToday = 0,
            RiskLevel = RiskLevel.LOW,
            LastUpdated = DateTime.UtcNow
        };
        _context.UserStates.Add(userState);

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUserState), new { id = user.UserId }, new UserInfoDto
        {
            UserId = user.UserId,
            Name = user.Name,
            City = user.City,
            Email = user.Email,
            Role = user.Role.ToString()
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserInfoDto>> UpdateUser(string id, [FromBody] UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound($"User {id} not found");
        }

        if (!string.IsNullOrEmpty(dto.Name))
            user.Name = dto.Name;
        
        if (!string.IsNullOrEmpty(dto.City))
            user.City = dto.City;
        
        if (!string.IsNullOrEmpty(dto.Email))
            user.Email = dto.Email;

        if (!string.IsNullOrEmpty(dto.Password))
            user.PasswordHash = _authService.HashPassword(dto.Password);

        if (!string.IsNullOrEmpty(dto.Role))
        {
            user.Role = dto.Role.ToUpperInvariant() switch
            {
                "ADMIN" => UserRole.Admin,
                "PRESENTER" => UserRole.Presenter,
                _ => UserRole.User
            };
        }

        await _context.SaveChangesAsync();

        return Ok(new UserInfoDto
        {
            UserId = user.UserId,
            Name = user.Name,
            City = user.City,
            Email = user.Email,
            Role = user.Role.ToString()
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteUser(string id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound($"User {id} not found");
        }

        // Don't allow deleting self
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == id)
        {
            return BadRequest("Cannot delete your own account");
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("reset-daily")]
    [Authorize(Roles = "Admin,Presenter")]
    public async Task<ActionResult> ResetDailyStates()
    {
        await _userStateManager.ResetDailyStatesAsync();
        return Ok(new { message = "Daily states reset successfully" });
    }
}
