using TurkcellDecisionEngine.Core.Entities;

namespace TurkcellDecisionEngine.Core.Interfaces;

public interface IUserStateManager
{
    Task<UserState> GetOrCreateUserStateAsync(string userId);
    Task<UserState> UpdateUserStateAsync(string userId, Event evt);
    Task<IEnumerable<UserState>> GetAllUserStatesAsync();
    Task ResetDailyStatesAsync();
}
