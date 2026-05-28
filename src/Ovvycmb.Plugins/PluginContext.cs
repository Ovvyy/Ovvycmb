using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Events;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.Plugins;

public class PluginContext(
    string pluginName,
    AccountRepository accountRepo,
    SettingsRepository settingsRepo,
    IEventBus eventBus,
    ILogger logger) : IPluginContext
{
    public IReadOnlyList<Account> GetAccounts() =>
        accountRepo.GetAllAsync().GetAwaiter().GetResult();

    public async Task PublishEventAsync(string eventType, string? payload = null)
    {
        if (Enum.TryParse<EventType>(eventType, out var type))
            await eventBus.PublishAsync(DomainEvent.Create(type, payload: payload));
    }

    public async Task<string?> GetSettingAsync(string key) =>
        await settingsRepo.GetAsync($"plugin.{pluginName}.{key}");

    public async Task SetSettingAsync(string key, string value) =>
        await settingsRepo.SetAsync($"plugin.{pluginName}.{key}", value);

    public void Log(string message, PluginLogLevel level = PluginLogLevel.Info)
    {
        switch (level)
        {
            case PluginLogLevel.Debug: logger.LogDebug("[Plugin:{Name}] {Message}", pluginName, message); break;
            case PluginLogLevel.Warning: logger.LogWarning("[Plugin:{Name}] {Message}", pluginName, message); break;
            case PluginLogLevel.Error: logger.LogError("[Plugin:{Name}] {Message}", pluginName, message); break;
            default: logger.LogInformation("[Plugin:{Name}] {Message}", pluginName, message); break;
        }
    }
}
