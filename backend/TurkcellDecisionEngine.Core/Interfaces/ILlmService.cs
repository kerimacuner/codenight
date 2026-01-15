namespace TurkcellDecisionEngine.Core.Interfaces;

/// <summary>
/// LLM servisine soyutlanmış erişim sağlar
/// </summary>
public interface ILlmService
{
    /// <summary>
    /// Doğal dil açıklamasından kural oluşturur
    /// </summary>
    /// <param name="prompt">Kullanıcının girdiği doğal dil açıklaması</param>
    /// <returns>Üretilen kural bilgileri</returns>
    Task<GeneratedRule> GenerateRuleFromNaturalLanguageAsync(string prompt);
}

/// <summary>
/// LLM tarafından üretilen kural bilgileri
/// </summary>
/// <param name="Condition">Kural koşulu (örn: internet_today_gb > 15)</param>
/// <param name="Action">Aksiyon tipi (örn: DATA_USAGE_WARNING)</param>
/// <param name="Message">Kullanıcıya gösterilecek mesaj</param>
/// <param name="Explanation">LLM'in açıklaması (opsiyonel)</param>
public record GeneratedRule(
    string Condition,
    string Action,
    string Message,
    string? Explanation = null
);
