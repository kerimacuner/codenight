namespace TurkcellDecisionEngine.Core.Enums;

public enum ActionType
{
    // Warning actions
    DATA_USAGE_WARNING,
    SPEND_ALERT,
    CONTENT_SUGGESTION,
    CRITICAL_ALERT,
    
    // Nudge actions (gentle reminders)
    DATA_USAGE_NUDGE,
    SPEND_NUDGE,
    
    // Cooldown suggestions
    CONTENT_COOLDOWN_SUGGESTION
}
