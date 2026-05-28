namespace Ovvycmb.Core.Models;

public class GameClient
{
    public Guid AccountId { get; set; }
    public int ProcessId { get; set; }
    public nint WindowHandle { get; set; }
    public string WindowTitle { get; set; } = string.Empty;
    public GameType GameType { get; set; }
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;
    public WindowRect Rect { get; set; }
    public bool IsMinimized { get; set; }
    public bool IsVisible { get; set; }
    public int MonitorIndex { get; set; }
}

public record WindowRect(int X, int Y, int Width, int Height)
{
    public static WindowRect Empty => new(0, 0, 0, 0);
    public bool IsEmpty => Width == 0 && Height == 0;
}

public class MonitorInfo
{
    public int Index { get; set; }
    public string Name { get; set; } = string.Empty;
    public WindowRect Bounds { get; set; } = WindowRect.Empty;
    public WindowRect WorkArea { get; set; } = WindowRect.Empty;
    public bool IsPrimary { get; set; }
    public double ScaleFactor { get; set; } = 1.0;
}
