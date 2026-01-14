using TurkcellDecisionEngine.Core.Entities;

namespace TurkcellDecisionEngine.Core.Interfaces;

public interface IAuthService
{
    Task<(User? User, string? Token)> LoginAsync(string userId, string password);
    Task<User?> ValidateTokenAsync(string token);
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}
