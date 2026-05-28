using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Events;
using Ovvycmb.Core.Interfaces;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.Services;

public class LayoutService(
    LayoutRepository repo,
    AccountRepository accountRepo,
    IWindowManager windowManager,
    IEventBus eventBus,
    ILogger<LayoutService> logger)
{
    public async Task<IReadOnlyList<LayoutProfile>> GetAllAsync(CancellationToken ct = default) =>
        await repo.GetAllAsync(ct);

    public async Task<LayoutProfile> CreateAsync(LayoutProfile profile, CancellationToken ct = default)
    {
        var created = await repo.AddAsync(profile, ct);
        logger.LogInformation("Layout profile created: {Name}", created.Name);
        return created;
    }

    public async Task<LayoutProfile> UpdateAsync(LayoutProfile profile, CancellationToken ct = default) =>
        await repo.UpdateAsync(profile, ct);

    public async Task DeleteAsync(Guid id, CancellationToken ct = default) =>
        await repo.DeleteAsync(id, ct);

    public async Task<bool> ApplyProfileAsync(Guid profileId, CancellationToken ct = default)
    {
        var profile = await repo.GetByIdAsync(profileId, ct);
        if (profile is null)
        {
            logger.LogWarning("Layout profile {Id} not found", profileId);
            return false;
        }

        var accounts = await accountRepo.GetAllAsync(ct);
        var clients = accounts
            .Where(a => a.WindowHandle != nint.Zero)
            .Select(a => new GameClient
            {
                AccountId = a.Id,
                WindowHandle = a.WindowHandle,
                ProcessId = a.ProcessId ?? 0,
                GameType = a.GameType
            }).ToList();

        var result = await windowManager.ApplyLayoutAsync(profile, clients, ct);
        if (result)
        {
            logger.LogInformation("Layout profile {Name} applied successfully", profile.Name);
            await eventBus.PublishAsync(DomainEvent.Create(EventType.LayoutApplied, payload: profileId.ToString()), ct);
        }
        return result;
    }

    public async Task<LayoutProfile> GenerateAutoLayoutAsync(int monitorIndex = 0, CancellationToken ct = default)
    {
        var accounts = await accountRepo.GetAllAsync(ct);
        var monitors = await windowManager.GetMonitorsAsync(ct);
        var monitor = monitors.ElementAtOrDefault(monitorIndex) ?? monitors.FirstOrDefault();
        if (monitor is null) return new LayoutProfile { Name = "Auto" };

        var clientAccounts = accounts.Where(a => a.IsActive).ToList();
        int count = clientAccounts.Count;
        if (count == 0) return new LayoutProfile { Name = "Auto" };

        int cols = (int)Math.Ceiling(Math.Sqrt(count));
        int rows = (int)Math.Ceiling((double)count / cols);
        double cellW = monitor.WorkArea.Width / (double)cols;
        double cellH = monitor.WorkArea.Height / (double)rows;

        var layouts = clientAccounts.Select((acc, i) => new WindowLayout
        {
            AccountId = acc.Id,
            MonitorIndex = monitorIndex,
            X = monitor.WorkArea.X + (i % cols) * cellW,
            Y = monitor.WorkArea.Y + (i / cols) * cellH,
            Width = cellW,
            Height = cellH
        }).ToList();

        return new LayoutProfile
        {
            Name = $"Auto Grid {cols}x{rows}",
            MonitorCount = monitors.Count,
            Layouts = layouts
        };
    }
}
