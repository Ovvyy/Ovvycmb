using Microsoft.Extensions.DependencyInjection;
using Ovvycmb.Ipc.Hubs;

namespace Ovvycmb.Ipc.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddOvvycmbIpc(this IServiceCollection services)
    {
        services.AddSingleton<OvvycmbHub>();
        return services;
    }
}
