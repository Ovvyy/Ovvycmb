using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Events;
using Ovvycmb.Core.Interfaces;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.Services;

public class AccountService(
    AccountRepository repo,
    IWindowManager windowManager,
    IEventBus eventBus,
    ILogger<AccountService> logger)
{
    public async Task<IReadOnlyList<Account>> GetAllAsync(CancellationToken ct = default) =>
        await repo.GetAllAsync(ct);

    public async Task<Account?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await repo.GetByIdAsync(id, ct);

    public async Task<Account> CreateAsync(Account account, CancellationToken ct = default)
    {
        var created = await repo.AddAsync(account, ct);
        logger.LogInformation("Account created: {Name}", created.Name);
        await eventBus.PublishAsync(DomainEvent.Create(EventType.AccountDetected, created.Id, message: $"Account {created.Name} created"), ct);
        return created;
    }

    public async Task<Account> UpdateAsync(Account account, CancellationToken ct = default)
    {
        var updated = await repo.UpdateAsync(account, ct);
        await eventBus.PublishAsync(DomainEvent.Create(EventType.AccountStatusChanged, updated.Id), ct);
        return updated;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        await repo.DeleteAsync(id, ct);
        logger.LogInformation("Account deleted: {Id}", id);
    }

    public async Task<bool> FocusAsync(Guid accountId, CancellationToken ct = default)
    {
        var account = await repo.GetByIdAsync(accountId, ct);
        if (account?.WindowHandle == nint.Zero) return false;

        var result = await windowManager.FocusWindowAsync(account.WindowHandle, ct);
        if (result)
        {
            account.IsFocused = true;
            await repo.UpdateAsync(account, ct);
            await eventBus.PublishAsync(DomainEvent.Create(EventType.AccountFocused, accountId), ct);
        }
        return result;
    }

    public async Task SyncWithDetectedClientsAsync(IReadOnlyList<GameClient> clients, CancellationToken ct = default)
    {
        var accounts = await repo.GetAllAsync(ct);
        var accountsByPid = accounts.Where(a => a.ProcessId.HasValue).ToDictionary(a => a.ProcessId!.Value);

        foreach (var client in clients)
        {
            if (accountsByPid.TryGetValue(client.ProcessId, out var account))
            {
                account.WindowHandle = client.WindowHandle;
                account.Status = AccountStatus.Connected;
                await repo.UpdateAsync(account, ct);
            }
        }

        foreach (var account in accounts.Where(a => a.ProcessId.HasValue))
        {
            if (!clients.Any(c => c.ProcessId == account.ProcessId))
            {
                account.Status = AccountStatus.Offline;
                account.WindowHandle = nint.Zero;
                await repo.UpdateAsync(account, ct);
                await eventBus.PublishAsync(DomainEvent.Create(EventType.AccountLost, account.Id), ct);
            }
        }
    }
}
