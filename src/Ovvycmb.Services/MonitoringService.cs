using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Configuration;
using Ovvycmb.Core.Interfaces;

namespace Ovvycmb.Services;

public class MonitoringService(
    IWindowManager windowManager,
    IServiceScopeFactory scopeFactory,
    AppConfiguration config,
    ILogger<MonitoringService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("MonitoringService started (scan interval: {Interval}ms)", config.WindowScanIntervalMs);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var clients = await windowManager.DetectGameClientsAsync(stoppingToken);
                using var scope = scopeFactory.CreateScope();
                var accountService = scope.ServiceProvider.GetRequiredService<AccountService>();
                await accountService.SyncWithDetectedClientsAsync(clients, stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogWarning(ex, "Error during window scan");
            }

            await Task.Delay(config.WindowScanIntervalMs, stoppingToken);
        }
    }
}
