using Microsoft.Extensions.DependencyInjection;
using Ovvycmb.Core.Interfaces;
using Ovvycmb.Hotkeys.Services;

namespace Ovvycmb.Hotkeys.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddHotkeys(this IServiceCollection services)
    {
        services.AddSingleton<HotkeyService>();
        services.AddSingleton<IHotkeyService>(sp => sp.GetRequiredService<HotkeyService>());
        return services;
    }
}
