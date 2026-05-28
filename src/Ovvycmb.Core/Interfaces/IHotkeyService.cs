using Ovvycmb.Core.Models;

namespace Ovvycmb.Core.Interfaces;

public interface IHotkeyService
{
    Task<bool> RegisterAsync(HotkeyBinding binding, CancellationToken ct = default);
    Task<bool> UnregisterAsync(Guid bindingId, CancellationToken ct = default);
    Task UnregisterAllAsync(CancellationToken ct = default);
    IReadOnlyList<HotkeyBinding> GetRegistered();
    event EventHandler<HotkeyTriggeredEventArgs> HotkeyTriggered;
}

public class HotkeyTriggeredEventArgs(HotkeyBinding binding) : EventArgs
{
    public HotkeyBinding Binding { get; } = binding;
    public DateTime TriggeredAt { get; } = DateTime.UtcNow;
}
