using System.Runtime.InteropServices;

namespace Ovvycmb.Hotkeys.Native;

internal static class HotkeyNative
{
#if WINDOWS
    [DllImport("user32.dll", SetLastError = true)]
    internal static extern bool RegisterHotKey(nint hWnd, int id, uint fsModifiers, uint vk);

    [DllImport("user32.dll", SetLastError = true)]
    internal static extern bool UnregisterHotKey(nint hWnd, int id);
#endif

    internal const uint MOD_ALT = 0x0001;
    internal const uint MOD_CONTROL = 0x0002;
    internal const uint MOD_SHIFT = 0x0004;
    internal const uint MOD_WIN = 0x0008;
    internal const uint MOD_NOREPEAT = 0x4000;
    internal const int WM_HOTKEY = 0x0312;
}
