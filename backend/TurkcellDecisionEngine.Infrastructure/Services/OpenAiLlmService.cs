using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenAI;
using OpenAI.Chat;
using TurkcellDecisionEngine.Core.Interfaces;

namespace TurkcellDecisionEngine.Infrastructure.Services;

/// <summary>
/// OpenAI API kullanarak doğal dilden kural oluşturma servisi
/// </summary>
public class OpenAiLlmService : ILlmService
{
    private readonly ChatClient _chatClient;
    private readonly ILogger<OpenAiLlmService> _logger;
    private readonly string _model;

    private const string SystemPrompt = """
        Sen bir Turkcell karar motoru kural asistanısın. Kullanıcının doğal dilde tanımladığı kuralları, 
        sistemin anlayacağı formata dönüştürüyorsun.

        ## Kullanılabilir Değişkenler:
        - `internet_today_gb`: Kullanıcının bugünkü internet kullanımı (GB cinsinden)
        - `spend_today_try`: Kullanıcının bugünkü harcaması (TL cinsinden)
        - `content_minutes_today`: Kullanıcının bugünkü içerik tüketimi (dakika cinsinden)

        ## Kullanılabilir Aksiyonlar:
        - `DATA_USAGE_WARNING`: Veri kullanım uyarısı (yüksek internet kullanımı için)
        - `DATA_USAGE_NUDGE`: Hafif veri kullanım hatırlatması
        - `SPEND_ALERT`: Harcama uyarısı (yüksek harcama için)
        - `SPEND_NUDGE`: Hafif harcama hatırlatması
        - `CONTENT_SUGGESTION`: İçerik önerisi
        - `CONTENT_COOLDOWN_SUGGESTION`: İçerik molası önerisi
        - `CRITICAL_ALERT`: Kritik uyarı (çok yüksek kullanım/harcama için)

        ## Koşul Yazım Kuralları:
        - Karşılaştırma operatörleri: >, <, >=, <=, ==
        - Mantıksal operatörler: && (ve), || (veya)
        - BETWEEN kullanımı: `internet_today_gb BETWEEN 5 AND 10`

        ## Yanıt Formatı:
        SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:
        {
            "condition": "koşul ifadesi",
            "action": "AKSİYON_TİPİ",
            "message": "Kullanıcıya gösterilecek Türkçe mesaj",
            "explanation": "Kuralın kısa açıklaması"
        }

        ## Örnek:
        Kullanıcı: "Günlük internet 15 GB'ı geçerse uyar"
        Yanıt:
        {
            "condition": "internet_today_gb > 15",
            "action": "DATA_USAGE_WARNING",
            "message": "Bugün 15 GB üzerinde internet kullandınız. Paketinizi kontrol etmenizi öneririz.",
            "explanation": "15 GB üstü internet kullanımında veri uyarısı gönderir"
        }
        """;

    public OpenAiLlmService(IConfiguration configuration, ILogger<OpenAiLlmService> logger)
    {
        _logger = logger;
        
        // Environment variable'dan veya configuration'dan API key al
        var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY") 
            ?? configuration["OpenAI:ApiKey"];
        
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("OpenAI API key is required. Set OPENAI_API_KEY environment variable or OpenAI:ApiKey in configuration.");
        }
        
        _model = configuration["OpenAI:Model"] ?? "gpt-4o-mini";
        
        var client = new OpenAIClient(apiKey);
        _chatClient = client.GetChatClient(_model);
    }

    public async Task<GeneratedRule> GenerateRuleFromNaturalLanguageAsync(string prompt)
    {
        try
        {
            _logger.LogInformation("Generating rule from prompt: {Prompt}", prompt);

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(SystemPrompt),
                new UserChatMessage(prompt)
            };

            var options = new ChatCompletionOptions
            {
                Temperature = 0.3f,
                MaxOutputTokenCount = 500
            };

            var response = await _chatClient.CompleteChatAsync(messages, options);
            var content = response.Value.Content[0].Text;

            _logger.LogDebug("OpenAI response: {Response}", content);

            // Parse JSON response
            var result = JsonSerializer.Deserialize<GeneratedRuleDto>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (result == null)
            {
                throw new InvalidOperationException("Failed to parse LLM response");
            }

            return new GeneratedRule(
                result.Condition ?? throw new InvalidOperationException("Condition is required"),
                result.Action ?? throw new InvalidOperationException("Action is required"),
                result.Message ?? "Hesabınızla ilgili bir güncelleme var.",
                result.Explanation
            );
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse LLM response as JSON");
            throw new InvalidOperationException("LLM yanıtı geçersiz format. Lütfen tekrar deneyin.", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating rule from natural language");
            throw;
        }
    }

    private class GeneratedRuleDto
    {
        public string? Condition { get; set; }
        public string? Action { get; set; }
        public string? Message { get; set; }
        public string? Explanation { get; set; }
    }
}
