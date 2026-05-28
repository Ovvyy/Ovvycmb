using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Events;
using Ovvycmb.Core.Models;

namespace Ovvycmb.Ipc.Hubs;

public class OvvycmbHub(IEventBus eventBus, ILogger<OvvycmbHub> logger) : Hub
{
    private static readonly Dictionary<string, CancellationTokenSource> _subscriptions = [];

    public override async Task OnConnectedAsync()
    {
        logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        var cts = new CancellationTokenSource();
        _subscriptions[Context.ConnectionId] = cts;

        _ = Task.Run(async () =>
        {
            await foreach (var evt in eventBus.SubscribeAsync(cts.Token))
            {
                try
                {
                    await Clients.Client(Context.ConnectionId).SendAsync("event", new
                    {
                        id = evt.Id,
                        type = evt.EventType.ToString(),
                        accountId = evt.AccountId,
                        message = evt.Message,
                        payload = evt.Payload,
                        timestamp = evt.Timestamp
                    }, cts.Token);
                }
                catch { break; }
            }
        }, cts.Token);

        await base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        if (_subscriptions.TryGetValue(Context.ConnectionId, out var cts))
        {
            cts.Cancel();
            _subscriptions.Remove(Context.ConnectionId);
        }
        return base.OnDisconnectedAsync(exception);
    }

    public async Task Ping() => await Clients.Caller.SendAsync("pong", DateTime.UtcNow);
}
