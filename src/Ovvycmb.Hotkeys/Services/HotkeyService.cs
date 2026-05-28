using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Interfaces;
using Ovvycmb.Core.Models;
using Ovvycmb.Hotkeys.Native;

namespace Ovvycmb.Hotkeys.Services;

public class HotkeyService(ILogger<HotkeyService> logger) : IHotkeyService, IDisposable
{
    private readonly Dictionary<int, HotkeyBinding> _registered = [];
    private int _nextId = 1;
    private nint _messageWindowHandle = nint.Zero;

    public event EventHandler<HotkeyTriggeredEventArgs>? HotkeyTriggered;

    public Task<bool> RegisterAsync(HotkeyBinding binding, CancellationToken ct = default)
    {
        var (mods, vk) = HotkeyParser.Parse(binding.KeyCombo);
        if (vk == 0)
        {
            logger.LogWarning("Invalid key combo: {KeyCombo}", binding.KeyCombo);
            return Task.FromResult(false);
        }

        int id = _nextId++;
#if WINDOWS
        bool result = HotkeyNative.RegisterHotKey(_messageWindowHandle, id, mods, vk);
        if (result)
        {
            _registered[id] = binding;
            logger.LogInformation("Hotkey registered: {Name} ({KeyCombo})", binding.Name, binding.KeyCombo);
        }
        else
        {
            logger.LogWarning("Failed to register hotkey: {KeyCombo}", binding.KeyCombo);
        }
        return Task.FromResult(result);
#else
        _registered[id] = binding;
        return Task.FromResult(true);
#endif
    }

    public Task<bool> UnregisterAsync(Guid bindingId, CancellationToken ct = default)
    {
        var entry = _registered.FirstOrDefault(kv => kv.Value.Id == bindingId);
        if (entry.Value is null) return Task.FromResult(false);
#if WINDOWS
        HotkeyNative.UnregisterHotKey(_messageWindowHandle, entry.Key);
#endif
        _registered.Remove(entry.Key);
        return Task.FromResult(true);
    }

    public Task UnregisterAllAsync(CancellationToken ct = default)
    {
#if WINDOWS
        foreach (var id in _registered.Keys)
            HotkeyNative.UnregisterHotKey(_messageWindowHandle, id);
#endif
        _registered.Clear();
        return Task.CompletedTask;
    }

    public IReadOnlyList<HotkeyBinding> GetRegistered() => [.. _registered.Values];

    internal void OnHotkeyMessage(int id)
    {
        if (_registered.TryGetValue(id, out var binding))
            HotkeyTriggered?.Invoke(this, new HotkeyTriggeredEventArgs(binding));
    }

    public void Dispose()
    {
        UnregisterAllAsync().GetAwaiter().GetResult();
    }
}
