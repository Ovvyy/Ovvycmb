using Ovvycmb.Core.Interfaces;
using Ovvycmb.Core.Models;
using Ovvycmb.WindowManager.Services;

namespace Ovvycmb.WindowManager;

public class WindowManagerService(
    WindowDetectionService detection,
    WindowOperationsService ops,
    MonitorDetectionService monitorDetection,
    LayoutEngine layoutEngine) : IWindowManager
{
    public Task<IReadOnlyList<GameClient>> DetectGameClientsAsync(CancellationToken ct = default) =>
        detection.DetectAsync(ct);

    public Task<bool> FocusWindowAsync(nint handle, CancellationToken ct = default) =>
        ops.FocusAsync(handle);

    public Task<bool> MoveWindowAsync(nint handle, WindowRect rect, CancellationToken ct = default) =>
        ops.MoveAsync(handle, rect);

    public Task<bool> ApplyLayoutAsync(LayoutProfile profile, IReadOnlyList<GameClient> clients, CancellationToken ct = default) =>
        layoutEngine.ApplyAsync(profile, clients, ct);

    public Task<IReadOnlyList<MonitorInfo>> GetMonitorsAsync(CancellationToken ct = default) =>
        monitorDetection.DetectAsync();

    public Task<WindowRect> GetWindowRectAsync(nint handle, CancellationToken ct = default) =>
        ops.GetRectAsync(handle);

    public Task<bool> SetWindowClickThroughAsync(nint handle, bool clickThrough, CancellationToken ct = default) =>
        ops.SetClickThroughAsync(handle, clickThrough);
}
