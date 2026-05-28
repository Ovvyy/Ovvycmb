using System.Windows;
using System.IO;

namespace Ovvycmb.App.Tray;

public class SystemTrayService : IDisposable
{
    private System.Windows.Forms.NotifyIcon? _notifyIcon;

    public event EventHandler? ShowWindowRequested;
    public event EventHandler? ExitRequested;

    public void Initialize(Window owner)
    {
        _notifyIcon = new System.Windows.Forms.NotifyIcon
        {
            Visible = true,
            Text = "Ovvycmb — Multi-Account Organizer"
        };

        try
        {
            var iconPath = Path.Combine(AppContext.BaseDirectory, "Resources", "app.ico");
            _notifyIcon.Icon = File.Exists(iconPath)
                ? new System.Drawing.Icon(iconPath)
                : System.Drawing.SystemIcons.Application;
        }
        catch
        {
            _notifyIcon.Icon = System.Drawing.SystemIcons.Application;
        }

        var menu = new System.Windows.Forms.ContextMenuStrip();
        var showItem = new System.Windows.Forms.ToolStripMenuItem("Open Ovvycmb");
        showItem.Click += (_, _) => owner.Dispatcher.Invoke(() => ShowWindowRequested?.Invoke(this, EventArgs.Empty));
        var exitItem = new System.Windows.Forms.ToolStripMenuItem("Exit");
        exitItem.Click += (_, _) => owner.Dispatcher.Invoke(() => ExitRequested?.Invoke(this, EventArgs.Empty));
        menu.Items.Add(showItem);
        menu.Items.Add(new System.Windows.Forms.ToolStripSeparator());
        menu.Items.Add(exitItem);

        _notifyIcon.ContextMenuStrip = menu;
        _notifyIcon.DoubleClick += (_, _) => owner.Dispatcher.Invoke(() => ShowWindowRequested?.Invoke(this, EventArgs.Empty));
    }

    public void ShowBalloon(string title, string message, int timeoutMs = 3000) =>
        _notifyIcon?.ShowBalloonTip(timeoutMs, title, message, System.Windows.Forms.ToolTipIcon.Info);

    public void Dispose() => _notifyIcon?.Dispose();
}
