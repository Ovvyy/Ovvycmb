using Microsoft.EntityFrameworkCore;
using Ovvycmb.Core.Interfaces;
using Ovvycmb.Core.Models;

namespace Ovvycmb.Storage.Repositories;

public class AgentReportRepository(AppDbContext db) : IRepository<AgentReport>
{
    public async Task<AgentReport?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await db.AgentReports.FindAsync([id], ct);

    public async Task<IReadOnlyList<AgentReport>> GetAllAsync(CancellationToken ct = default) =>
        await db.AgentReports.OrderByDescending(r => r.CreatedAt).Take(100).ToListAsync(ct);

    public async Task<AgentReport> AddAsync(AgentReport entity, CancellationToken ct = default)
    {
        db.AgentReports.Add(entity);
        await db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task<AgentReport> UpdateAsync(AgentReport entity, CancellationToken ct = default)
    {
        db.AgentReports.Update(entity);
        await db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var report = await db.AgentReports.FindAsync([id], ct);
        if (report is not null) { db.AgentReports.Remove(report); await db.SaveChangesAsync(ct); }
    }

    public async Task<IReadOnlyList<AgentReport>> GetRecentAsync(int limit = 20, CancellationToken ct = default) =>
        await db.AgentReports.OrderByDescending(r => r.CreatedAt).Take(limit).ToListAsync(ct);
}
