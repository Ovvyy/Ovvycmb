using Microsoft.Extensions.Logging;
using Ovvycmb.AI.Client;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.AI.Agents;

public abstract class AgentBase(
    ClaudeApiClient claude,
    AgentReportRepository reportRepo,
    ILogger logger)
{
    public abstract AgentType AgentType { get; }
    protected abstract string SystemPrompt { get; }

    public async Task<AgentReport> RunAsync(string? context = null, CancellationToken ct = default)
    {
        logger.LogInformation("Agent {AgentType} starting analysis", AgentType);

        var userMessage = BuildUserMessage(context);
        string? response;
        try
        {
            response = await claude.CompleteAsync(SystemPrompt, userMessage, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Agent {AgentType} failed", AgentType);
            response = null;
        }

        var report = BuildReport(response);
        await reportRepo.AddAsync(report, ct);

        logger.LogInformation("Agent {AgentType} completed: {Severity}", AgentType, report.Severity);
        return report;
    }

    protected virtual string BuildUserMessage(string? context) =>
        context is null
            ? $"Please analyze the Ovvycmb desktop application and provide a comprehensive {AgentType} report."
            : $"Please analyze the following context and provide a {AgentType} report:\n\n{context}";

    protected abstract AgentReport BuildReport(string? claudeResponse);

    protected static AgentReport CreateReport(AgentType agentType, string reportType, string summary, string details,
        ReportSeverity severity = ReportSeverity.Info, List<string>? recommendations = null) => new()
    {
        AgentType = agentType,
        ReportType = reportType,
        Summary = summary,
        Details = details,
        Severity = severity,
        Recommendations = recommendations ?? [],
        CreatedAt = DateTime.UtcNow
    };
}
