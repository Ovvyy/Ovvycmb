using Microsoft.Extensions.Logging;
using Ovvycmb.AI.Client;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.AI.Agents;

public class ArchitectAgent(
    ClaudeApiClient claude,
    AgentReportRepository reportRepo,
    ILogger<ArchitectAgent> logger)
    : AgentBase(claude, reportRepo, logger)
{
    public override AgentType AgentType => AgentType.Architect;

    protected override string SystemPrompt => """
        You are an expert software architect reviewing the Ovvycmb desktop application.
        Ovvycmb is a premium multi-account organizer for DOFUS, DOFUS Retro, and WAKFU games.
        It is built with C# .NET 8, WPF + WebView2, ASP.NET Core, SignalR, Entity Framework Core + SQLite.

        Your role is to:
        1. Review architectural decisions and identify technical debt
        2. Assess module coupling and cohesion
        3. Identify missing patterns or over-engineering
        4. Suggest refactoring opportunities
        5. Evaluate scalability and maintainability

        Provide a structured report with: executive summary, findings (with severity), and actionable recommendations.
        Format your response as JSON: { "summary": "...", "findings": [{"title": "...", "severity": "info|low|medium|high|critical", "description": "...", "recommendation": "..."}] }
        """;

    protected override AgentReport BuildReport(string? claudeResponse)
    {
        if (claudeResponse is null)
            return CreateReport(AgentType, "architecture-review", "Architecture review skipped (API not configured)",
                "Claude API key is not configured. Please add your API key in Settings > AI Agents.", ReportSeverity.Info);

        try
        {
            var parsed = System.Text.Json.JsonSerializer.Deserialize<ArchitectResponseDto>(claudeResponse,
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            var maxSeverity = parsed?.Findings?.Select(f => ParseSeverity(f.Severity)).DefaultIfEmpty(ReportSeverity.Info).Max() ?? ReportSeverity.Info;
            var recommendations = parsed?.Findings?.Select(f => f.Recommendation).Where(r => r is not null).Cast<string>().ToList() ?? [];

            return CreateReport(AgentType, "architecture-review",
                parsed?.Summary ?? "Architecture analysis complete",
                claudeResponse, maxSeverity, recommendations);
        }
        catch
        {
            return CreateReport(AgentType, "architecture-review", "Architecture analysis complete", claudeResponse, ReportSeverity.Info);
        }
    }

    private static ReportSeverity ParseSeverity(string? s) => s?.ToLower() switch
    {
        "critical" => ReportSeverity.Critical,
        "high" => ReportSeverity.High,
        "medium" => ReportSeverity.Medium,
        "low" => ReportSeverity.Low,
        _ => ReportSeverity.Info
    };

    private record ArchitectResponseDto(string? Summary, List<FindingDto>? Findings);
    private record FindingDto(string? Title, string? Severity, string? Description, string? Recommendation);
}
