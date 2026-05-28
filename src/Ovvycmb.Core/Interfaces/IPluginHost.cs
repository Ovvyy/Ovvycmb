using Ovvycmb.Core.Models;

namespace Ovvycmb.Core.Interfaces;

public interface IPluginHost
{
    Task<IReadOnlyList<PluginManifest>> GetInstalledPluginsAsync(CancellationToken ct = default);
    Task<bool> LoadPluginAsync(string pluginPath, CancellationToken ct = default);
    Task<bool> UnloadPluginAsync(Guid pluginId, CancellationToken ct = default);
    Task<bool> EnablePluginAsync(Guid pluginId, CancellationToken ct = default);
    Task<bool> DisablePluginAsync(Guid pluginId, CancellationToken ct = default);
}
