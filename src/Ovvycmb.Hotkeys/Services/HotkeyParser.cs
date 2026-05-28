using System.Windows.Forms;

namespace Ovvycmb.Hotkeys.Services;

public static class HotkeyParser
{
    public static (uint modifiers, uint virtualKey) Parse(string keyCombo)
    {
        uint mods = 0;
        uint vk = 0;
        var parts = keyCombo.Split('+', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
        foreach (var part in parts)
        {
            switch (part.ToUpperInvariant())
            {
                case "CTRL": case "CONTROL": mods |= 0x0002; break;
                case "ALT": mods |= 0x0001; break;
                case "SHIFT": mods |= 0x0004; break;
                case "WIN": mods |= 0x0008; break;
                default:
                    if (Enum.TryParse<Keys>(part, true, out var key))
                        vk = (uint)key;
                    break;
            }
        }
        mods |= 0x4000; // MOD_NOREPEAT
        return (mods, vk);
    }
}
