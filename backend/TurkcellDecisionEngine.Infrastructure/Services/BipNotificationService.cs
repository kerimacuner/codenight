using Microsoft.Extensions.Logging;
using TurkcellDecisionEngine.Core.Interfaces;

namespace TurkcellDecisionEngine.Infrastructure.Services;

public class BipNotificationService : INotificationService
{
    private readonly ILogger<BipNotificationService> _logger;

    public BipNotificationService(ILogger<BipNotificationService> logger)
    {
        _logger = logger;
    }

    public Task SendNotificationAsync(string userId, string actionType, string message)
    {
        // This is a mock implementation - in production, this would integrate with BiP API
        var notification = new
        {
            user_id = userId,
            action_type = actionType,
            message = message,
            sent_at = DateTime.UtcNow,
            channel = "BiP"
        };

        _logger.LogInformation(
            "[BiP Mock] Notification sent to user {UserId}: {ActionType} - {Message}",
            userId, actionType, message);

        // Simulate async operation
        return Task.CompletedTask;
    }
}
