using Ovvycmb.Core.Models;

namespace Ovvycmb.Plugins;

public interface IPlugin
{
    string Name { get; }
    string Version { get; }
    string Author { get; }
    IReadOnlyList<GameType> SupportedGames { get; }
    IReadOnlyList<string> Capabilities { get; }

    Task InitializeAsync(IPluginContext context, CancellationToken ct = default);
    Task ShutdownAsync(CancellationToken ct = default);
    Task<bool> HandleEventAsync(PluginEvent evt, CancellationToken ct = default);
}

public interface IPluginContext
{
    IReadOnlyList<Account> GetAccounts();
    Task PublishEventAsync(string eventType, string? payload = null);
    Task<string?> GetSettingAsync(string key);
    Task SetSettingAsync(string key, string value);
    void Log(string message, PluginLogLevel level = PluginLogLevel.Info);
}

public enum PluginLogLevel { Debug, Info, Warning, Error }

public record PluginEvent(string Type, Guid? AccountId, string? Payload, DateTime Timestamp);
