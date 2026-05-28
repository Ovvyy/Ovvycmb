namespace Ovvycmb.Core.Models;

public enum HotkeyAction
{
    FocusAccount, CycleAccounts, FocusPrevious, FocusNext,
    ApplyLayout, ToggleOverlay, OpenDashboard,
    AutoReady, AutoAcceptTrade, SyncHotkey,
    Custom
}

public class HotkeyBinding
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public HotkeyAction Action { get; set; }
    public string KeyCombo { get; set; } = string.Empty;
    public Guid? TargetId { get; set; }
    public string? CustomCommand { get; set; }
    public bool IsEnabled { get; set; } = true;
    public bool IsGlobal { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
