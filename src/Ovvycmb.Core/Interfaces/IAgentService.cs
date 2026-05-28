using Ovvycmb.Core.Models;

namespace Ovvycmb.Core.Interfaces;

public interface IAgentService
{
    Task<AgentReport> RunAgentAsync(AgentType agentType, string? context = null, CancellationToken ct = default);
    Task<IReadOnlyList<AgentReport>> GetRecentReportsAsync(int limit = 20, CancellationToken ct = default);
    Task<bool> IsAvailableAsync(CancellationToken ct = default);
}
