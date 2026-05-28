using System.Reflection;
using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Events;
using Ovvycmb.Core.Interfaces;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.Plugins;

public class PluginHost(
    AccountRepository accountRepo,
    SettingsRepository settingsRepo,
    IEventBus eventBus,
    ILogger<PluginHost> logger) : IPluginHost
{
    private readonly Dictionary<Guid, (PluginManifest Manifest, IPlugin Plugin)> _loaded = [];

    public async Task<IReadOnlyList<PluginManifest>> GetInstalledPluginsAsync(CancellationToken ct = default)
    {
        await Task.CompletedTask;
        return _loaded.Values.Select(v => v.Manifest).ToList();
    }

    public async Task<bool> LoadPluginAsync(string pluginPath, CancellationToken ct = default)
    {
        try
        {
            var assembly = Assembly.LoadFrom(pluginPath);
            var pluginType = assembly.GetTypes().FirstOrDefault(t => typeof(IPlugin).IsAssignableFrom(t) && !t.IsInterface);
            if (pluginType is null)
            {
                logger.LogWarning("No IPlugin implementation found in {Path}", pluginPath);
                return false;
            }

            var plugin = (IPlugin)Activator.CreateInstance(pluginType)!;
            var manifest = new PluginManifest
            {
                Name = plugin.Name,
                DisplayName = plugin.Name,
                Version = plugin.Version,
                Author = plugin.Author,
                SupportedGames = plugin.SupportedGames.ToList(),
                Capabilities = plugin.Capabilities.ToList(),
                EntryPoint = pluginPath,
                Status = PluginStatus.Installed
            };

            var context = new PluginContext(plugin.Name, accountRepo, settingsRepo, eventBus,
                logger);
            await plugin.InitializeAsync(context, ct);

            manifest.Status = PluginStatus.Enabled;
            _loaded[manifest.Id] = (manifest, plugin);

            logger.LogInformation("Plugin loaded: {Name} v{Version}", plugin.Name, plugin.Version);

            await eventBus.PublishAsync(DomainEvent.Create(EventType.PluginLoaded,
                message: $"Plugin {plugin.Name} loaded"), ct);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to load plugin from {Path}", pluginPath);
            await eventBus.PublishAsync(DomainEvent.Create(EventType.PluginError,
                message: $"Plugin load failed: {ex.Message}"), ct);
            return false;
        }
    }

    public async Task<bool> UnloadPluginAsync(Guid pluginId, CancellationToken ct = default)
    {
        if (!_loaded.TryGetValue(pluginId, out var entry)) return false;
        await entry.Plugin.ShutdownAsync(ct);
        _loaded.Remove(pluginId);
        await eventBus.PublishAsync(DomainEvent.Create(EventType.PluginUnloaded,
            message: $"Plugin {entry.Manifest.Name} unloaded"), ct);
        return true;
    }

    public Task<bool> EnablePluginAsync(Guid pluginId, CancellationToken ct = default)
    {
        if (!_loaded.TryGetValue(pluginId, out var entry)) return Task.FromResult(false);
        entry.Manifest.Status = PluginStatus.Enabled;
        return Task.FromResult(true);
    }

    public Task<bool> DisablePluginAsync(Guid pluginId, CancellationToken ct = default)
    {
        if (!_loaded.TryGetValue(pluginId, out var entry)) return Task.FromResult(false);
        entry.Manifest.Status = PluginStatus.Disabled;
        return Task.FromResult(true);
    }

    public async Task BroadcastEventAsync(PluginEvent evt, CancellationToken ct = default)
    {
        foreach (var (_, (manifest, plugin)) in _loaded)
        {
            if (manifest.Status != PluginStatus.Enabled) continue;
            try
            {
                await plugin.HandleEventAsync(evt, ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Plugin {Name} failed to handle event {Type}", manifest.Name, evt.Type);
            }
        }
    }
}
