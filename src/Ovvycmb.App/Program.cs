using System.Windows;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Ovvycmb.AI.Extensions;
using Ovvycmb.App;
using Ovvycmb.Core.Configuration;
using Ovvycmb.Core.Events;
using Ovvycmb.Hotkeys.Extensions;
using Ovvycmb.Overlay;
using Ovvycmb.Overlay.Extensions;
using Ovvycmb.Plugins.Extensions;
using Ovvycmb.Services.Extensions;
using Ovvycmb.Storage.Extensions;
using Ovvycmb.Telemetry;
using Ovvycmb.WindowManager.Extensions;

namespace Ovvycmb.App;

public static class Program
{
    [STAThread]
    public static async Task Main(string[] args)
    {
        var config = new AppConfiguration();

        var host = Host.CreateDefaultBuilder(args)
            .UseOvvycmbTelemetry(config)
            .ConfigureServices(services =>
            {
                services.AddSingleton(config);
                services.AddSingleton<IEventBus, EventBus>();
                services.AddStorage(config);
                services.AddWindowManager();
                services.AddHotkeys();
                services.AddOvvycmbServices();
                services.AddAiAgents(config);
                services.AddPlugins();
                services.AddOverlay();
                services.AddOvvycmbTelemetry();
                services.AddSingleton<AppHost>();
                services.AddSingleton<Tray.SystemTrayService>();
                services.AddSingleton<MainWindow>();
            })
            .Build();

        await host.Services.MigrateAsync();

        var wpfApp = new Application();
        wpfApp.ShutdownMode = ShutdownMode.OnExplicitShutdown;

        var appHost = host.Services.GetRequiredService<AppHost>();
        await appHost.StartAsync();

        var mainWindow = host.Services.GetRequiredService<MainWindow>();
        wpfApp.MainWindow = mainWindow;
        mainWindow.Show();

        wpfApp.Run();

        await appHost.StopAsync();
    }
}
