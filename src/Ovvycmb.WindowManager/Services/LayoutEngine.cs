using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Models;

namespace Ovvycmb.WindowManager.Services;

public class LayoutEngine(
    WindowOperationsService ops,
    MonitorDetectionService monitorDetection,
    ILogger<LayoutEngine> logger)
{
    public async Task<bool> ApplyAsync(LayoutProfile profile, IReadOnlyList<GameClient> clients, CancellationToken ct = default)
    {
        if (profile.Layouts.Count == 0)
        {
            logger.LogWarning("Layout profile {Name} has no layouts", profile.Name);
            return false;
        }

        bool allSuccess = true;
        foreach (var layout in profile.Layouts)
        {
            var client = clients.FirstOrDefault(c => c.AccountId == layout.AccountId);
            if (client is null) continue;

            var monitors = await monitorDetection.DetectAsync();
            var monitor = monitors.ElementAtOrDefault(layout.MonitorIndex) ?? monitors.FirstOrDefault();
            if (monitor is null) continue;

            var targetRect = new WindowRect(
                (int)(monitor.Bounds.X + layout.X),
                (int)(monitor.Bounds.Y + layout.Y),
                (int)layout.Width,
                (int)layout.Height);

            bool moved = await ops.MoveAsync(client.WindowHandle, targetRect);
            if (!moved)
            {
                logger.LogWarning("Failed to move window {Handle}", client.WindowHandle);
                allSuccess = false;
            }
        }
        return allSuccess;
    }
}
