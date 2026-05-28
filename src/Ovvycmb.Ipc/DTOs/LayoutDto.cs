using Ovvycmb.Core.Models;

namespace Ovvycmb.Ipc.DTOs;

public record LayoutProfileDto(
    Guid Id, string Name, string? Description,
    string? Hotkey, int MonitorCount, bool IsDefault,
    List<WindowLayoutDto> Layouts, DateTime CreatedAt)
{
    public static LayoutProfileDto FromModel(LayoutProfile p) => new(
        p.Id, p.Name, p.Description, p.Hotkey, p.MonitorCount, p.IsDefault,
        p.Layouts.Select(WindowLayoutDto.FromModel).ToList(), p.CreatedAt);
}

public record WindowLayoutDto(
    Guid AccountId, int MonitorIndex,
    double X, double Y, double Width, double Height, int ZOrder)
{
    public static WindowLayoutDto FromModel(WindowLayout l) => new(
        l.AccountId, l.MonitorIndex, l.X, l.Y, l.Width, l.Height, l.ZOrder);
}

public record CreateLayoutRequest(string Name, string? Description, string? Hotkey, int MonitorCount);
