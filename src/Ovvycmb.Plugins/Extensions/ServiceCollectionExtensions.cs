using Microsoft.Extensions.DependencyInjection;
using Ovvycmb.Core.Interfaces;

namespace Ovvycmb.Plugins.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPlugins(this IServiceCollection services)
    {
        services.AddSingleton<PluginHost>();
        services.AddSingleton<IPluginHost>(sp => sp.GetRequiredService<PluginHost>());
        return services;
    }
}
