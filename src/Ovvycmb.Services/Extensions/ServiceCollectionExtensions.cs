using Microsoft.Extensions.DependencyInjection;

namespace Ovvycmb.Services.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddOvvycmbServices(this IServiceCollection services)
    {
        services.AddScoped<AccountService>();
        services.AddScoped<LayoutService>();
        services.AddHostedService<MonitoringService>();
        return services;
    }
}
