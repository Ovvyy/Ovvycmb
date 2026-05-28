using System.Threading.Channels;
using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Models;

namespace Ovvycmb.Core.Events;

public interface IEventBus
{
    Task PublishAsync(DomainEvent domainEvent, CancellationToken ct = default);
    IAsyncEnumerable<DomainEvent> SubscribeAsync(CancellationToken ct = default);
    IDisposable Subscribe(Func<DomainEvent, Task> handler);
}

public sealed class EventBus : IEventBus, IDisposable
{
    private readonly List<Channel<DomainEvent>> _channels = [];
    private readonly Lock _lock = new();
    private readonly ILogger<EventBus> _logger;

    public EventBus(ILogger<EventBus> logger)
    {
        _logger = logger;
    }

    public async Task PublishAsync(DomainEvent domainEvent, CancellationToken ct = default)
    {
        _logger.LogDebug("Publishing event {EventType} for account {AccountId}", domainEvent.EventType, domainEvent.AccountId);
        List<Channel<DomainEvent>> channels;
        lock (_lock)
        {
            channels = [.. _channels];
        }
        foreach (var channel in channels)
        {
            await channel.Writer.WriteAsync(domainEvent, ct);
        }
    }

    public async IAsyncEnumerable<DomainEvent> SubscribeAsync([System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct = default)
    {
        var channel = Channel.CreateUnbounded<DomainEvent>(new UnboundedChannelOptions { SingleReader = true });
        lock (_lock) { _channels.Add(channel); }
        try
        {
            await foreach (var evt in channel.Reader.ReadAllAsync(ct))
                yield return evt;
        }
        finally
        {
            lock (_lock) { _channels.Remove(channel); }
            channel.Writer.TryComplete();
        }
    }

    public IDisposable Subscribe(Func<DomainEvent, Task> handler)
    {
        var channel = Channel.CreateUnbounded<DomainEvent>(new UnboundedChannelOptions { SingleReader = true });
        lock (_lock) { _channels.Add(channel); }
        var cts = new CancellationTokenSource();
        _ = Task.Run(async () =>
        {
            try
            {
                await foreach (var evt in channel.Reader.ReadAllAsync(cts.Token))
                    await handler(evt);
            }
            catch (OperationCanceledException) { }
        }, cts.Token);
        return new Subscription(() =>
        {
            cts.Cancel();
            lock (_lock) { _channels.Remove(channel); }
            channel.Writer.TryComplete();
        });
    }

    public void Dispose()
    {
        lock (_lock)
        {
            foreach (var ch in _channels)
                ch.Writer.TryComplete();
            _channels.Clear();
        }
    }

    private sealed class Subscription(Action dispose) : IDisposable
    {
        public void Dispose() => dispose();
    }
}
