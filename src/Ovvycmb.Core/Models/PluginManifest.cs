namespace Ovvycmb.Core.Models;

public enum PluginStatus { Installed, Enabled, Disabled, Error, Updating }

public class PluginManifest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Version { get; set; } = "1.0.0";
    public string Author { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<GameType> SupportedGames { get; set; } = [];
    public List<string> Capabilities { get; set; } = [];
    public string EntryPoint { get; set; } = string.Empty;
    public PluginStatus Status { get; set; } = PluginStatus.Installed;
    public bool IsOfficial { get; set; }
    public string? ConfigJson { get; set; }
    public DateTime InstalledAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
