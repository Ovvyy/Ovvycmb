namespace Ovvycmb.Core.Models;

public class LayoutProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Hotkey { get; set; }
    public int MonitorCount { get; set; } = 1;
    public bool IsDefault { get; set; }
    public List<WindowLayout> Layouts { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class WindowLayout
{
    public Guid AccountId { get; set; }
    public int MonitorIndex { get; set; }
    public double X { get; set; }
    public double Y { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
    public int ZOrder { get; set; }
}

public enum LayoutPreset
{
    Grid2x2, Grid2x4, Grid3x3, Grid4x4,
    SideBySide, Master1Side, Master1Bottom,
    Custom
}
