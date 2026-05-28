using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Models;
using Ovvycmb.WindowManager.Native;

namespace Ovvycmb.WindowManager.Services;

public class WindowOperationsService(ILogger<WindowOperationsService> logger)
{
    public Task<bool> FocusAsync(nint handle)
    {
#if WINDOWS
        if (NativeMethods.IsIconic(handle))
            NativeMethods.ShowWindow(handle, NativeMethods.SW_RESTORE);
        bool result = NativeMethods.SetForegroundWindow(handle);
        NativeMethods.BringWindowToTop(handle);
        return Task.FromResult(result);
#else
        return Task.FromResult(false);
#endif
    }

    public Task<bool> MoveAsync(nint handle, WindowRect rect)
    {
#if WINDOWS
        bool result = NativeMethods.MoveWindow(handle, rect.X, rect.Y, rect.Width, rect.Height, true);
        return Task.FromResult(result);
#else
        return Task.FromResult(false);
#endif
    }

    public Task<WindowRect> GetRectAsync(nint handle)
    {
#if WINDOWS
        if (NativeMethods.GetWindowRect(handle, out var r))
            return Task.FromResult(new WindowRect(r.Left, r.Top, r.Width, r.Height));
#endif
        return Task.FromResult(WindowRect.Empty);
    }

    public Task<bool> SetClickThroughAsync(nint handle, bool clickThrough)
    {
#if WINDOWS
        var current = NativeMethods.GetWindowLong(handle, NativeMethods.GWL_EXSTYLE);
        nint newStyle = clickThrough
            ? current | NativeMethods.WS_EX_TRANSPARENT | NativeMethods.WS_EX_LAYERED
            : current & ~(NativeMethods.WS_EX_TRANSPARENT);
        NativeMethods.SetWindowLong(handle, NativeMethods.GWL_EXSTYLE, newStyle);
        return Task.FromResult(true);
#else
        return Task.FromResult(false);
#endif
    }
}
