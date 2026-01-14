using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TurkcellDecisionEngine.Api.Hubs;

[Authorize]
public class DecisionHub : Hub
{
    private readonly ILogger<DecisionHub> _logger;

    public DecisionHub(ILogger<DecisionHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            // Add user to their personal group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
            _logger.LogInformation("User {UserId} connected to SignalR hub", userId);

            // Add admins and presenters to the admin group for broadcast
            if (role == "Admin" || role == "Presenter")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "admins");
                _logger.LogInformation("User {UserId} added to admins group", userId);
            }
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
            
            var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
            if (role == "Admin" || role == "Presenter")
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, "admins");
            }

            _logger.LogInformation("User {UserId} disconnected from SignalR hub", userId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    // Client can call this to join a specific user's updates (for admin viewing specific user)
    public async Task JoinUserGroup(string userId)
    {
        var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
        
        // Only admins and presenters can join other user's groups
        if (role == "Admin" || role == "Presenter")
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
            _logger.LogInformation("Admin joined user group: {UserId}", userId);
        }
    }

    public async Task LeaveUserGroup(string userId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
    }
}
