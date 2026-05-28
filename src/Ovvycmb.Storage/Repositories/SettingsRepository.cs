using Microsoft.EntityFrameworkCore;

namespace Ovvycmb.Storage.Repositories;

public class SettingsRepository(AppDbContext db)
{
    public async Task<string?> GetAsync(string key, CancellationToken ct = default)
    {
        var setting = await db.Settings.FindAsync([key], ct);
        return setting?.Value;
    }

    public async Task SetAsync(string key, string? value, CancellationToken ct = default)
    {
        var existing = await db.Settings.FindAsync([key], ct);
        if (existing is null)
            db.Settings.Add(new AppSetting { Key = key, Value = value });
        else
        {
            existing.Value = value;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync(ct);
    }

    public async Task<T?> GetJsonAsync<T>(string key, CancellationToken ct = default)
    {
        var raw = await GetAsync(key, ct);
        if (raw is null) return default;
        return System.Text.Json.JsonSerializer.Deserialize<T>(raw);
    }

    public async Task SetJsonAsync<T>(string key, T value, CancellationToken ct = default) =>
        await SetAsync(key, System.Text.Json.JsonSerializer.Serialize(value), ct);
}
