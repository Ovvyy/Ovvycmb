using Prometheus;

namespace Ovvycmb.Telemetry;

public class OvvycmbMetrics
{
    public readonly Counter EventsPublished = Metrics.CreateCounter(
        "ovvycmb_events_published_total", "Total domain events published", ["event_type"]);

    public readonly Gauge ActiveGameClients = Metrics.CreateGauge(
        "ovvycmb_active_game_clients", "Number of active game clients");

    public readonly Gauge ActiveAccounts = Metrics.CreateGauge(
        "ovvycmb_active_accounts", "Number of active accounts");

    public readonly Counter LayoutsApplied = Metrics.CreateCounter(
        "ovvycmb_layouts_applied_total", "Total layout applications");

    public readonly Counter HotkeysTriggered = Metrics.CreateCounter(
        "ovvycmb_hotkeys_triggered_total", "Total hotkey triggers", ["action"]);

    public readonly Counter AgentReports = Metrics.CreateCounter(
        "ovvycmb_agent_reports_total", "Total AI agent reports", ["agent_type", "severity"]);

    public readonly Histogram WindowScanDuration = Metrics.CreateHistogram(
        "ovvycmb_window_scan_duration_seconds", "Window scan duration");

    public readonly Histogram IpcRequestDuration = Metrics.CreateHistogram(
        "ovvycmb_ipc_request_duration_seconds", "IPC request duration", ["endpoint"]);
}
