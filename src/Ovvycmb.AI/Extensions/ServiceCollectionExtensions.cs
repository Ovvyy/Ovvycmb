using Microsoft.Extensions.DependencyInjection;
using Ovvycmb.AI.Agents;
using Ovvycmb.AI.Client;
using Ovvycmb.AI.Orchestration;
using Ovvycmb.Core.Configuration;
using Ovvycmb.Core.Interfaces;

namespace Ovvycmb.AI.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAiAgents(this IServiceCollection services, AppConfiguration config)
    {
        services.AddHttpClient<ClaudeApiClient>(client =>
        {
            client.BaseAddress = new Uri("https://api.anthropic.com");
            client.Timeout = TimeSpan.FromSeconds(120);
        });

        services.AddScoped<ArchitectAgent>();
        services.AddScoped<SecurityAgent>();
        services.AddScoped<PerformanceAgent>();
        services.AddScoped<QAAgent>();
        services.AddScoped<CodeReviewerAgent>();
        services.AddScoped<RefactorAgent>();
        services.AddScoped<OcrVisionAgent>();

        services.AddSingleton<AgentMemory>();
        services.AddScoped<AgentOrchestrator>();
        services.AddScoped<IAgentService>(sp => sp.GetRequiredService<AgentOrchestrator>());

        return services;
    }
}
