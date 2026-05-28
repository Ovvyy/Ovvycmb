using Ovvycmb.Core.Models;

namespace Ovvycmb.Core.Interfaces;

public interface IWindowManager
{
    Task<IReadOnlyList<GameClient>> DetectGameClientsAsync(CancellationToken ct = default);
    Task<bool> FocusWindowAsync(nint handle, CancellationToken ct = default);
    Task<bool> MoveWindowAsync(nint handle, WindowRect rect, CancellationToken ct = default);
    Task<bool> ApplyLayoutAsync(LayoutProfile profile, IReadOnlyList<GameClient> clients, CancellationToken ct = default);
    Task<IReadOnlyList<MonitorInfo>> GetMonitorsAsync(CancellationToken ct = default);
    Task<WindowRect> GetWindowRectAsync(nint handle, CancellationToken ct = default);
    Task<bool> SetWindowClickThroughAsync(nint handle, bool clickThrough, CancellationToken ct = default);
}
