namespace Ovvycmb.Core.Configuration;

public class AppConfiguration
{
    public const string SectionName = "Ovvycmb";

    public string DataDirectory { get; set; } = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "Ovvycmb");

    public string DatabasePath => Path.Combine(DataDirectory, "ovvycmb.db");
    public string LogDirectory => Path.Combine(DataDirectory, "logs");
    public string PluginsDirectory => Path.Combine(DataDirectory, "plugins");

    public int IpcPort { get; set; } = 7337;
    public string IpcHost { get; set; } = "localhost";

    public int WindowScanIntervalMs { get; set; } = 500;
    public int HotkeyCheckIntervalMs { get; set; } = 100;

    public bool EnableOverlay { get; set; } = true;
    public bool EnableTelemetry { get; set; } = true;
    public bool StartMinimized { get; set; } = false;
    public bool StartWithWindows { get; set; } = false;

    public ClaudeConfiguration Claude { get; set; } = new();
}

public class ClaudeConfiguration
{
    public string? ApiKey { get; set; }
    public string Model { get; set; } = "claude-opus-4-7";
    public int MaxTokens { get; set; } = 4096;
    public bool Enabled => !string.IsNullOrEmpty(ApiKey);
}
