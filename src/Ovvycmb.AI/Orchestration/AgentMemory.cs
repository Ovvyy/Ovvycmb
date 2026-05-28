using System.Collections.Concurrent;
using Ovvycmb.Core.Models;

namespace Ovvycmb.AI.Orchestration;

public class AgentMemory
{
    private readonly ConcurrentDictionary<AgentType, List<AgentReport>> _memory = new();
    private const int MaxReportsPerAgent = 10;

    public void Store(AgentReport report)
    {
        var list = _memory.GetOrAdd(report.AgentType, _ => []);
        lock (list)
        {
            list.Insert(0, report);
            if (list.Count > MaxReportsPerAgent)
                list.RemoveRange(MaxReportsPerAgent, list.Count - MaxReportsPerAgent);
        }
    }

    public IReadOnlyList<AgentReport> GetHistory(AgentType agentType)
    {
        if (_memory.TryGetValue(agentType, out var list))
            lock (list) return [.. list];
        return [];
    }

    public string BuildContext(AgentType agentType)
    {
        var history = GetHistory(agentType);
        if (history.Count == 0) return string.Empty;
        return string.Join("\n\n", history.Take(3).Select(r =>
            $"[{r.CreatedAt:yyyy-MM-dd HH:mm}] Previous report ({r.Severity}): {r.Summary}\n{r.Details[..Math.Min(500, r.Details.Length)]}"));
    }
}
