using Microsoft.Extensions.Logging;
using Ovvycmb.AI.Agents;
using Ovvycmb.Core.Events;
using Ovvycmb.Core.Interfaces;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.AI.Orchestration;

public class AgentOrchestrator : IAgentService
{
    private readonly Dictionary<AgentType, AgentBase> _agents;
    private readonly AgentReportRepository _reportRepo;
    private readonly IEventBus _eventBus;
    private readonly ILogger<AgentOrchestrator> _logger;

    public AgentOrchestrator(
        ArchitectAgent architect,
        SecurityAgent security,
        PerformanceAgent performance,
        QAAgent qa,
        CodeReviewerAgent codeReviewer,
        RefactorAgent refactor,
        OcrVisionAgent ocrVision,
        AgentReportRepository reportRepo,
        IEventBus eventBus,
        ILogger<AgentOrchestrator> logger)
    {
        _reportRepo = reportRepo;
        _eventBus = eventBus;
        _logger = logger;

        _agents = new Dictionary<AgentType, AgentBase>
        {
            [AgentType.Architect] = architect,
            [AgentType.Security] = security,
            [AgentType.Performance] = performance,
            [AgentType.QA] = qa,
            [AgentType.CodeReviewer] = codeReviewer,
            [AgentType.Refactor] = refactor,
            [AgentType.OcrVision] = ocrVision
        };
    }

    public async Task<AgentReport> RunAgentAsync(AgentType agentType, string? context = null, CancellationToken ct = default)
    {
        if (!_agents.TryGetValue(agentType, out var agent))
            throw new InvalidOperationException($"Unknown agent type: {agentType}");

        await _eventBus.PublishAsync(DomainEvent.Create(EventType.AgentStarted,
            message: $"Agent {agentType} started"), ct);

        try
        {
            var report = await agent.RunAsync(context, ct);
            await _eventBus.PublishAsync(DomainEvent.Create(EventType.AgentReportReady,
                message: $"Agent {agentType} report ready: {report.Summary}"), ct);
            return report;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Agent {AgentType} failed", agentType);
            await _eventBus.PublishAsync(DomainEvent.Create(EventType.AgentError,
                message: $"Agent {agentType} failed: {ex.Message}"), ct);
            throw;
        }
    }

    public async Task<IReadOnlyList<AgentReport>> GetRecentReportsAsync(int limit = 20, CancellationToken ct = default) =>
        await _reportRepo.GetRecentAsync(limit, ct);

    public Task<bool> IsAvailableAsync(CancellationToken ct = default) =>
        Task.FromResult(true);

    public async Task RunAllAgentsAsync(string? context = null, CancellationToken ct = default)
    {
        _logger.LogInformation("Running all AI agents");
        foreach (var agentType in Enum.GetValues<AgentType>())
        {
            try
            {
                await RunAgentAsync(agentType, context, ct);
                await Task.Delay(1000, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Agent {AgentType} failed during full run", agentType);
            }
        }
    }
}
