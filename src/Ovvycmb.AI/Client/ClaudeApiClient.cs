using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Configuration;

namespace Ovvycmb.AI.Client;

public class ClaudeApiClient(
    HttpClient httpClient,
    AppConfiguration config,
    ILogger<ClaudeApiClient> logger)
{
    private const string ApiEndpoint = "https://api.anthropic.com/v1/messages";
    private const string AnthropicVersion = "2023-06-01";

    public async Task<string?> CompleteAsync(
        string systemPrompt,
        string userMessage,
        CancellationToken ct = default)
    {
        if (!config.Claude.Enabled)
        {
            logger.LogWarning("Claude API not configured — skipping AI agent call");
            return null;
        }

        var request = new
        {
            model = config.Claude.Model,
            max_tokens = config.Claude.MaxTokens,
            system = systemPrompt,
            messages = new[] { new { role = "user", content = userMessage } }
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, ApiEndpoint);
        req.Headers.Add("x-api-key", config.Claude.ApiKey);
        req.Headers.Add("anthropic-version", AnthropicVersion);
        req.Content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");

        try
        {
            using var response = await httpClient.SendAsync(req, ct);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
            return json
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Claude API call failed");
            return null;
        }
    }
}
