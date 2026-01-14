using TurkcellDecisionEngine.Core.Enums;

namespace TurkcellDecisionEngine.Core.Entities;

public class User
{
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PasswordHash { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    
    // Navigation properties
    public virtual UserState? UserState { get; set; }
    public virtual ICollection<Event> Events { get; set; } = new List<Event>();
    public virtual ICollection<Decision> Decisions { get; set; } = new List<Decision>();
    public virtual ICollection<UserAction> Actions { get; set; } = new List<UserAction>();
}
