using Microsoft.EntityFrameworkCore;
using Ovvycmb.Core.Interfaces;
using Ovvycmb.Core.Models;

namespace Ovvycmb.Storage.Repositories;

public class LayoutRepository(AppDbContext db) : IRepository<LayoutProfile>
{
    public async Task<LayoutProfile?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await db.LayoutProfiles.FindAsync([id], ct);

    public async Task<IReadOnlyList<LayoutProfile>> GetAllAsync(CancellationToken ct = default) =>
        await db.LayoutProfiles.OrderBy(l => l.Name).ToListAsync(ct);

    public async Task<LayoutProfile> AddAsync(LayoutProfile entity, CancellationToken ct = default)
    {
        db.LayoutProfiles.Add(entity);
        await db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task<LayoutProfile> UpdateAsync(LayoutProfile entity, CancellationToken ct = default)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        db.LayoutProfiles.Update(entity);
        await db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var layout = await db.LayoutProfiles.FindAsync([id], ct);
        if (layout is not null)
        {
            db.LayoutProfiles.Remove(layout);
            await db.SaveChangesAsync(ct);
        }
    }

    public async Task<LayoutProfile?> GetDefaultAsync(CancellationToken ct = default) =>
        await db.LayoutProfiles.FirstOrDefaultAsync(l => l.IsDefault, ct);
}
