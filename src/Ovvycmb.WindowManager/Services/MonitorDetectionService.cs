using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Models;
using Ovvycmb.WindowManager.Native;

namespace Ovvycmb.WindowManager.Services;

public class MonitorDetectionService(ILogger<MonitorDetectionService> logger)
{
    public Task<IReadOnlyList<MonitorInfo>> DetectAsync()
    {
#if WINDOWS
        var monitors = new List<MonitorInfo>();
        int index = 0;
        NativeMethods.EnumDisplayMonitors(nint.Zero, nint.Zero, (hMonitor, _, ref rect, _) =>
        {
            var info = new NativeMethods.MONITORINFOEX { cbSize = System.Runtime.InteropServices.Marshal.SizeOf<NativeMethods.MONITORINFOEX>() };
            if (NativeMethods.GetMonitorInfo(hMonitor, ref info))
            {
                NativeMethods.GetDpiForMonitor(hMonitor, 0, out uint dpiX, out _);
                double scale = dpiX / 96.0;
                monitors.Add(new MonitorInfo
                {
                    Index = index++,
                    Name = info.szDevice,
                    Bounds = new WindowRect(info.rcMonitor.Left, info.rcMonitor.Top, info.rcMonitor.Width, info.rcMonitor.Height),
                    WorkArea = new WindowRect(info.rcWork.Left, info.rcWork.Top, info.rcWork.Width, info.rcWork.Height),
                    IsPrimary = (info.dwFlags & 1) != 0,
                    ScaleFactor = scale
                });
            }
            return true;
        }, nint.Zero);
        return Task.FromResult<IReadOnlyList<MonitorInfo>>(monitors);
#else
        return Task.FromResult<IReadOnlyList<MonitorInfo>>([new MonitorInfo { Index = 0, Name = "Primary", Bounds = new WindowRect(0, 0, 1920, 1080), WorkArea = new WindowRect(0, 0, 1920, 1040), IsPrimary = true }]);
#endif
    }
}
