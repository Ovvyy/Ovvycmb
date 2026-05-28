using Microsoft.EntityFrameworkCore;
using Ovvycmb.Core.Interfaces;
using Ovvycmb.Core.Models;

namespace Ovvycmb.Storage.Repositories;

public class AccountRepository(AppDbContext db) : IRepository<Account>
{
    public async Task<Account?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await db.Accounts.Include(a => a.Group).FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task<IReadOnlyList<Account>> GetAllAsync(CancellationToken ct = default) =>
        await db.Accounts.Include(a => a.Group).OrderBy(a => a.SortOrder).ToListAsync(ct);

    public async Task<Account> AddAsync(Account entity, CancellationToken ct = default)
    {
        entity.CreatedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        db.Accounts.Add(entity);
        await db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task<Account> UpdateAsync(Account entity, CancellationToken ct = default)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        db.Accounts.Update(entity);
        await db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var account = await db.Accounts.FindAsync([id], ct);
        if (account is not null)
        {
            db.Accounts.Remove(account);
            await db.SaveChangesAsync(ct);
        }
    }

    public async Task<Account?> GetByProcessIdAsync(int processId, CancellationToken ct = default) =>
        await db.Accounts.FirstOrDefaultAsync(a => a.ProcessId == processId, ct);

    public async Task<IReadOnlyList<AccountGroup>> GetGroupsAsync(CancellationToken ct = default) =>
        await db.AccountGroups.Include(g => g.Accounts).ToListAsync(ct);
}
