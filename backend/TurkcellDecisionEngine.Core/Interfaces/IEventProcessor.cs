using TurkcellDecisionEngine.Core.Entities;

namespace TurkcellDecisionEngine.Core.Interfaces;

public interface IEventProcessor
{
    Task<Decision?> ProcessEventAsync(Event evt);
    Task<IEnumerable<Event>> GetRecentEventsAsync(int count = 50);
    Task<IEnumerable<Event>> GetEventsByUserAsync(string userId);
}
