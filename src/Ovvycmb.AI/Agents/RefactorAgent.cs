using Microsoft.Extensions.Logging;
using Ovvycmb.AI.Client;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.AI.Agents;

public class RefactorAgent(
    ClaudeApiClient claude,
    AgentReportRepository reportRepo,
    ILogger<RefactorAgent> logger)
    : AgentBase(claude, reportRepo, logger)
{
    public override AgentType AgentType => AgentType.Refactor;

    protected override string SystemPrompt => """
        You are a software architect proposing refactoring improvements for the Ovvycmb application.

        Identify: opportunities to simplify module boundaries, extract common patterns,
        apply design patterns where beneficial, reduce dependency complexity,
        improve testability, and enhance code readability.

        Provide JSON: { "summary": "...", "proposals": [{"title": "...", "impact": "low|medium|high",
        "effort": "low|medium|high", "description": "...", "beforeCode": "...", "afterCode": "..."}] }
        """;

    protected override AgentReport BuildReport(string? claudeResponse)
    {
        if (claudeResponse is null)
            return CreateReport(AgentType, "refactor-suggestions", "Refactor analysis skipped (API not configured)",
                "Configure Claude API key to enable refactor agent.", ReportSeverity.Info);

        return CreateReport(AgentType, "refactor-suggestions", "Refactor analysis completed", claudeResponse, ReportSeverity.Info);
    }
}
