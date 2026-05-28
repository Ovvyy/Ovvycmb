using Microsoft.Extensions.Logging;
using Ovvycmb.AI.Client;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.AI.Agents;

public class CodeReviewerAgent(
    ClaudeApiClient claude,
    AgentReportRepository reportRepo,
    ILogger<CodeReviewerAgent> logger)
    : AgentBase(claude, reportRepo, logger)
{
    public override AgentType AgentType => AgentType.CodeReviewer;

    protected override string SystemPrompt => """
        You are a senior C# developer reviewing code for the Ovvycmb desktop application.

        Review for: naming conventions, SOLID principles adherence, proper async/await usage,
        null safety, exception handling patterns, code duplication, complexity,
        and C# 12 best practices.

        Provide JSON: { "summary": "...", "overallScore": 0-100,
        "issues": [{"file": "...", "line": 0, "severity": "...", "description": "...", "suggestion": "..."}] }
        """;

    protected override AgentReport BuildReport(string? claudeResponse)
    {
        if (claudeResponse is null)
            return CreateReport(AgentType, "code-review", "Code review skipped (API not configured)",
                "Configure Claude API key to enable code review agent.", ReportSeverity.Info);

        return CreateReport(AgentType, "code-review", "Code review completed", claudeResponse, ReportSeverity.Info);
    }
}
