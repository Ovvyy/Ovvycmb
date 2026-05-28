using Microsoft.Extensions.Logging;
using Ovvycmb.AI.Client;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.AI.Agents;

public class SecurityAgent(
    ClaudeApiClient claude,
    AgentReportRepository reportRepo,
    ILogger<SecurityAgent> logger)
    : AgentBase(claude, reportRepo, logger)
{
    public override AgentType AgentType => AgentType.Security;

    protected override string SystemPrompt => """
        You are a security expert reviewing the Ovvycmb desktop application for vulnerabilities.
        Focus on: unsafe code patterns, dependency vulnerabilities, privilege escalation risks,
        local data exposure, IPC security (the app runs a local HTTP server on port 7337),
        plugin sandbox integrity, and WinAPI usage safety.

        Important: This app must NOT perform packet injection, memory modification, or any
        anti-cheat bypass. Flag any code that could be misused.

        Provide JSON: { "summary": "...", "riskLevel": "low|medium|high|critical",
        "findings": [{"title": "...", "severity": "...", "description": "...", "mitigation": "..."}] }
        """;

    protected override AgentReport BuildReport(string? claudeResponse)
    {
        if (claudeResponse is null)
            return CreateReport(AgentType, "security-scan", "Security scan skipped (API not configured)",
                "Configure Claude API key to enable security scanning.", ReportSeverity.Info);

        return CreateReport(AgentType, "security-scan", "Security scan completed", claudeResponse, ReportSeverity.Info);
    }
}
