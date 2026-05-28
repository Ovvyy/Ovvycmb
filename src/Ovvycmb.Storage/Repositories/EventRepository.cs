using Microsoft.EntityFrameworkCore;
using Ovvycmb.Core.Interfaces;
using Ovvycmb.Core.Models;

namespace Ovvycmb.Storage.Repositories;

public class EventRepository(AppDbContext db) : IRepository<DomainEvent>
{
    public async Task<DomainEvent?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await db.Events.FindAsync([id], ct);

    public async Task<IReadOnlyList<DomainEvent>> GetAllAsync(CancellationToken ct = default) =>
        await db.Events.OrderByDescending(e => e.Timestamp).Take(500).ToListAsync(ct);

    public async Task<DomainEvent> AddAsync(DomainEvent entity, CancellationToken ct = default)
    {
        db.Events.Add(entity);
        await db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task<DomainEvent> UpdateAsync(DomainEvent entity, CancellationToken ct = default)
    {
        db.Events.Update(entity);
        await db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var evt = await db.Events.FindAsync([id], ct);
        if (evt is not null) { db.Events.Remove(evt); await db.SaveChangesAsync(ct); }
    }

    public async Task<IReadOnlyList<DomainEvent>> GetRecentAsync(int limit = 50, CancellationToken ct = default) =>
        await db.Events.OrderByDescending(e => e.Timestamp).Take(limit).ToListAsync(ct);

    public async Task<IReadOnlyList<DomainEvent>> GetByAccountAsync(Guid accountId, int limit = 50, CancellationToken ct = default) =>
        await db.Events.Where(e => e.AccountId == accountId).OrderByDescending(e => e.Timestamp).Take(limit).ToListAsync(ct);

    public async Task PruneOldEventsAsync(TimeSpan maxAge, CancellationToken ct = default)
    {
        var cutoff = DateTime.UtcNow - maxAge;
        await db.Events.Where(e => e.Timestamp < cutoff).ExecuteDeleteAsync(ct);
    }
}
