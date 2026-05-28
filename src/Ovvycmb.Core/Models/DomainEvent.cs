namespace Ovvycmb.Core.Models;

public enum EventType
{
    // Account lifecycle
    AccountDetected, AccountLost, AccountStatusChanged, AccountFocused,
    // Game events
    CombatStarted, CombatEnded, TurnStarted, TurnEnded,
    TradeReceived, TradeAccepted, TradeDeclined,
    InviteReceived, InviteAccepted, InviteDeclined,
    PlayerDisconnected, PlayerReconnected,
    // Window events
    WindowMoved, WindowResized, WindowMinimized, WindowRestored,
    // Layout events
    LayoutApplied, LayoutSaved, LayoutDeleted,
    // Hotkey events
    HotkeyTriggered, HotkeyRegistered, HotkeyUnregistered,
    // Agent events
    AgentReportReady, AgentStarted, AgentCompleted, AgentError,
    // Plugin events
    PluginLoaded, PluginUnloaded, PluginError,
    // System events
    AppStarted, AppShuttingDown, ConfigChanged, OverlayToggled,
    // Error events
    ClientCrashed, ClientCaptcha, ClientTimeout
}

public class DomainEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public EventType EventType { get; set; }
    public Guid? AccountId { get; set; }
    public string Source { get; set; } = string.Empty;
    public string? Payload { get; set; }
    public string? Message { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public Account? Account { get; set; }

    public static DomainEvent Create(EventType type, Guid? accountId = null, string? payload = null, string? message = null) =>
        new() { EventType = type, AccountId = accountId, Payload = payload, Message = message, Source = "system" };
}
