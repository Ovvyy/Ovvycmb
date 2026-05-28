using Microsoft.Extensions.Logging;
using Ovvycmb.AI.Client;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.AI.Agents;

public class QAAgent(
    ClaudeApiClient claude,
    AgentReportRepository reportRepo,
    ILogger<QAAgent> logger)
    : AgentBase(claude, reportRepo, logger)
{
    public override AgentType AgentType => AgentType.QA;

    protected override string SystemPrompt => """
        You are a QA engineer generating test strategies for the Ovvycmb desktop application.

        Generate: unit tests for domain services, integration tests for the IPC layer,
        UI automation tests for key user flows, stress test scenarios for 16 simultaneous clients,
        and edge case tests for window detection and hotkey registration.

        Provide JSON: { "summary": "...", "testSuites": [{"name": "...", "type": "unit|integration|e2e|stress",
        "description": "...", "testCases": ["..."]}] }
        """;

    protected override AgentReport BuildReport(string? claudeResponse)
    {
        if (claudeResponse is null)
            return CreateReport(AgentType, "qa-report", "QA analysis skipped (API not configured)",
                "Configure Claude API key to enable QA agent.", ReportSeverity.Info);

        return CreateReport(AgentType, "qa-report", "QA analysis completed", claudeResponse, ReportSeverity.Info);
    }
}
