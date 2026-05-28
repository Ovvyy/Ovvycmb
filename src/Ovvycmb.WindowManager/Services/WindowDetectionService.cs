using System.Diagnostics;
using System.Text;
using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Models;
using Ovvycmb.WindowManager.Native;

namespace Ovvycmb.WindowManager.Services;

public class WindowDetectionService(ILogger<WindowDetectionService> logger)
{
    private static readonly string[] DofusUnityTitles = ["DOFUS", "Dofus"];
    private static readonly string[] DofusRetroTitles = ["DOFUS Retro", "Dofus Retro"];
    private static readonly string[] WakfuTitles = ["WAKFU", "Wakfu"];

    public Task<IReadOnlyList<GameClient>> DetectAsync(CancellationToken ct = default)
    {
#if WINDOWS
        var clients = new List<GameClient>();
        NativeMethods.EnumWindows((hwnd, _) =>
        {
            if (!NativeMethods.IsWindowVisible(hwnd)) return true;
            int len = NativeMethods.GetWindowTextLength(hwnd);
            if (len == 0) return true;
            var sb = new StringBuilder(len + 1);
            NativeMethods.GetWindowText(hwnd, sb, sb.Capacity);
            string title = sb.ToString();
            var gameType = DetectGameType(title);
            if (gameType is null) return true;
            NativeMethods.GetWindowThreadProcessId(hwnd, out uint pid);
            NativeMethods.GetWindowRect(hwnd, out var rect);
            clients.Add(new GameClient
            {
                WindowHandle = hwnd,
                ProcessId = (int)pid,
                WindowTitle = title,
                GameType = gameType.Value,
                IsMinimized = NativeMethods.IsIconic(hwnd),
                IsVisible = true,
                Rect = new WindowRect(rect.Left, rect.Top, rect.Width, rect.Height),
                LastSeenAt = DateTime.UtcNow
            });
            return true;
        }, nint.Zero);
        return Task.FromResult<IReadOnlyList<GameClient>>(clients);
#else
        return Task.FromResult<IReadOnlyList<GameClient>>([]);
#endif
    }

    private static GameType? DetectGameType(string title)
    {
        if (DofusRetroTitles.Any(t => title.Contains(t, StringComparison.OrdinalIgnoreCase)))
            return GameType.DofusRetro;
        if (DofusUnityTitles.Any(t => title.Contains(t, StringComparison.OrdinalIgnoreCase)))
            return GameType.DofusUnity;
        if (WakfuTitles.Any(t => title.Contains(t, StringComparison.OrdinalIgnoreCase)))
            return GameType.Wakfu;
        return null;
    }
}
