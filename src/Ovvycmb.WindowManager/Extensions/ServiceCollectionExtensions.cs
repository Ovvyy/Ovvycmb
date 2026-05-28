using Microsoft.Extensions.DependencyInjection;
using Ovvycmb.Core.Interfaces;
using Ovvycmb.WindowManager.Services;

namespace Ovvycmb.WindowManager.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddWindowManager(this IServiceCollection services)
    {
        services.AddSingleton<WindowDetectionService>();
        services.AddSingleton<WindowOperationsService>();
        services.AddSingleton<MonitorDetectionService>();
        services.AddSingleton<LayoutEngine>();
        services.AddSingleton<IWindowManager, WindowManagerService>();
        return services;
    }
}
