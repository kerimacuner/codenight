using System.ComponentModel.DataAnnotations;

namespace TurkcellDecisionEngine.Api.DTOs;

/// <summary>
/// Doğal dilden kural oluşturma isteği
/// </summary>
public class GenerateRuleRequest
{
    /// <summary>
    /// Kullanıcının doğal dilde yazdığı kural açıklaması
    /// </summary>
    [Required(ErrorMessage = "Prompt gereklidir")]
    [MinLength(10, ErrorMessage = "Prompt en az 10 karakter olmalıdır")]
    [MaxLength(500, ErrorMessage = "Prompt en fazla 500 karakter olabilir")]
    public string Prompt { get; set; } = string.Empty;
}

/// <summary>
/// LLM tarafından üretilen kural yanıtı
/// </summary>
public class GenerateRuleResponse
{
    /// <summary>
    /// Kural koşulu (örn: internet_today_gb > 15)
    /// </summary>
    public string Condition { get; set; } = string.Empty;
    
    /// <summary>
    /// Aksiyon tipi (örn: DATA_USAGE_WARNING)
    /// </summary>
    public string Action { get; set; } = string.Empty;
    
    /// <summary>
    /// Kullanıcıya gösterilecek mesaj
    /// </summary>
    public string Message { get; set; } = string.Empty;
    
    /// <summary>
    /// LLM'in açıklaması
    /// </summary>
    public string? Explanation { get; set; }
}
