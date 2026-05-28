using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Configuration;
using Ovvycmb.Core.Events;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.Overlay;

public class OverlayService(
    AppConfiguration config,
    IEventBus eventBus,
    IServiceScopeFactory scopeFactory,
    ILogger<OverlayService> logger) : IHostedService
{
    private OverlayWindow? _window;
    private IDisposable? _subscription;
    private bool _isVisible;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        if (!config.EnableOverlay) return Task.CompletedTask;
        logger.LogInformation("Starting overlay service");
        _subscription = eventBus.Subscribe(HandleEventAsync);
        return Task.CompletedTask;
    }

    public void ShowOverlay()
    {
        if (_window is null || !_window.IsLoaded) return;
        _window.Dispatcher.Invoke(() =>
        {
            _window.Visibility = System.Windows.Visibility.Visible;
            _isVisible = true;
        });
    }

    public void HideOverlay()
    {
        if (_window is null) return;
        _window.Dispatcher.Invoke(() =>
        {
            _window.Visibility = System.Windows.Visibility.Hidden;
            _isVisible = false;
        });
    }

    public void ToggleOverlay()
    {
        if (_isVisible) HideOverlay(); else ShowOverlay();
    }

    public void SetWindow(OverlayWindow window)
    {
        _window = window;
        if (config.EnableOverlay)
            ShowOverlay();
    }

    private async Task HandleEventAsync(DomainEvent evt)
    {
        if (_window is null) return;

        switch (evt.EventType)
        {
            case EventType.AccountStatusChanged:
            case EventType.AccountDetected:
            case EventType.AccountLost:
                using (var scope = scopeFactory.CreateScope())
                {
                    var repo = scope.ServiceProvider.GetRequiredService<AccountRepository>();
                    var accounts = await repo.GetAllAsync();
                    _window.UpdateAccounts(accounts);
                }
                break;
            case EventType.OverlayToggled:
                ToggleOverlay();
                break;
            case EventType.ClientCrashed:
                _window.ShowAlert("Client crash detected!", isError: true);
                break;
            case EventType.ClientCaptcha:
                _window.ShowAlert("Captcha detected!", isError: true);
                break;
            case EventType.CombatStarted:
                _window.ShowAlert("Combat started");
                break;
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _subscription?.Dispose();
        _window?.Dispatcher.Invoke(() => _window.Close());
        return Task.CompletedTask;
    }
}
