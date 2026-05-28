using Microsoft.Extensions.Logging;
using Ovvycmb.AI.Client;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.AI.Agents;

public class PerformanceAgent(
    ClaudeApiClient claude,
    AgentReportRepository reportRepo,
    ILogger<PerformanceAgent> logger)
    : AgentBase(claude, reportRepo, logger)
{
    public override AgentType AgentType => AgentType.Performance;

    protected override string SystemPrompt => """
        You are a performance engineering expert analyzing the Ovvycmb desktop application.
        The app must run efficiently while managing 8-16 DOFUS game clients simultaneously.

        Analyze: CPU usage from window scanning (every 500ms), memory footprint,
        SignalR event broadcasting efficiency, SQLite query patterns,
        WebView2 rendering overhead, and background service scheduling.

        Target metrics: <50MB RAM idle, <2% CPU idle, <100ms IPC response time.

        Provide JSON: { "summary": "...", "metrics": {"estimatedRamMb": 0, "estimatedCpuPercent": 0},
        "bottlenecks": [{"component": "...", "severity": "...", "description": "...", "fix": "..."}] }
        """;

    protected override AgentReport BuildReport(string? claudeResponse)
    {
        if (claudeResponse is null)
            return CreateReport(AgentType, "performance-analysis", "Performance analysis skipped (API not configured)",
                "Configure Claude API key to enable performance analysis.", ReportSeverity.Info);

        return CreateReport(AgentType, "performance-analysis", "Performance analysis completed", claudeResponse, ReportSeverity.Info);
    }
}
