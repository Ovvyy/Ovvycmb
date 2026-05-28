using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Configuration;
using Ovvycmb.Ipc;
using Ovvycmb.Services;

namespace Ovvycmb.App;

public class AppHost(
    IServiceProvider services,
    AppConfiguration config,
    ILogger<AppHost> logger)
{
    private WebApplication? _webApp;
    private CancellationTokenSource? _cts;

    public string FrontendUrl => $"http://{config.IpcHost}:{config.IpcPort}";

    public async Task StartAsync()
    {
        logger.LogInformation("Starting Ovvycmb IPC server on {Url}", FrontendUrl);
        _cts = new CancellationTokenSource();

        _webApp = IpcServer.CreateApp(services, config);
        await _webApp.StartAsync(_cts.Token);

        logger.LogInformation("Ovvycmb ready — UI at {Url}", FrontendUrl);
    }

    public async Task StopAsync()
    {
        logger.LogInformation("Shutting down Ovvycmb");
        _cts?.Cancel();
        if (_webApp is not null)
            await _webApp.StopAsync();
    }
}
