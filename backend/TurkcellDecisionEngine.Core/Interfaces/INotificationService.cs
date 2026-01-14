namespace TurkcellDecisionEngine.Core.Interfaces;

public interface INotificationService
{
    Task SendNotificationAsync(string userId, string actionType, string message);
}
