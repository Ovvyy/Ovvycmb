using Microsoft.Extensions.DependencyInjection;

namespace Ovvycmb.Overlay.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddOverlay(this IServiceCollection services)
    {
        services.AddSingleton<OverlayService>();
        services.AddHostedService(sp => sp.GetRequiredService<OverlayService>());
        return services;
    }
}
