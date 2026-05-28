using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;
using Microsoft.Extensions.Logging;
using Ovvycmb.Core.Models;

namespace Ovvycmb.Overlay;

public partial class OverlayWindow : Window
{
    private readonly ILogger<OverlayWindow> _logger;

    [DllImport("user32.dll")]
    private static extern nint SetWindowLong(nint hwnd, int nIndex, nint dwNewLong);

    [DllImport("user32.dll")]
    private static extern nint GetWindowLong(nint hwnd, int nIndex);

    private const int GWL_EXSTYLE = -20;
    private const int WS_EX_TRANSPARENT = 0x00000020;
    private const int WS_EX_LAYERED = 0x00080000;
    private const int WS_EX_NOACTIVATE = 0x08000000;

    public OverlayWindow(ILogger<OverlayWindow> logger)
    {
        _logger = logger;
        InitializeComponent();
        Loaded += OnLoaded;
    }

    private void OnLoaded(object sender, RoutedEventArgs e)
    {
        var hwnd = new System.Windows.Interop.WindowInteropHelper(this).Handle;
        var exStyle = GetWindowLong(hwnd, GWL_EXSTYLE);
        SetWindowLong(hwnd, GWL_EXSTYLE, exStyle | WS_EX_TRANSPARENT | WS_EX_LAYERED | WS_EX_NOACTIVATE);
        _logger.LogInformation("Overlay window initialized (click-through mode)");
    }

    public void UpdateAccounts(IReadOnlyList<Account> accounts)
    {
        Dispatcher.Invoke(() =>
        {
            AccountsPanel.Children.Clear();
            foreach (var account in accounts.Where(a => a.Status != AccountStatus.Offline))
            {
                AccountsPanel.Children.Add(CreateAccountWidget(account));
            }
        });
    }

    public void ShowAlert(string message, bool isError = false)
    {
        Dispatcher.Invoke(() =>
        {
            AlertText.Text = message;
            AlertContainer.BorderBrush = isError
                ? new SolidColorBrush(Color.FromRgb(255, 68, 68))
                : new SolidColorBrush(Color.FromRgb(79, 142, 247));
            AlertContainer.Visibility = Visibility.Visible;
        });

        Task.Delay(3000).ContinueWith(_ =>
            Dispatcher.Invoke(() => AlertContainer.Visibility = Visibility.Collapsed));
    }

    public void SetBounds(Rect bounds)
    {
        Dispatcher.Invoke(() =>
        {
            Left = bounds.Left;
            Top = bounds.Top;
            Width = bounds.Width;
            Height = bounds.Height;
        });
    }

    private static FrameworkElement CreateAccountWidget(Account account)
    {
        var hpPercent = account.MaxHp > 0 ? (double)account.Hp / account.MaxHp : 1.0;
        var accentColor = ParseColor(account.ColorTag);

        var panel = new StackPanel { Margin = new Thickness(0, 3, 0, 3) };

        var nameLabel = new TextBlock
        {
            Text = $"{account.CharacterName} (Lv.{account.Level})",
            Foreground = Brushes.White,
            FontSize = 11,
            FontWeight = FontWeights.SemiBold,
            Margin = new Thickness(0, 0, 0, 2)
        };

        var hpBg = new Border
        {
            Height = 6,
            CornerRadius = new CornerRadius(3),
            Background = new SolidColorBrush(Color.FromArgb(80, 255, 255, 255))
        };

        var hpFill = new Border
        {
            Height = 6,
            CornerRadius = new CornerRadius(3),
            HorizontalAlignment = HorizontalAlignment.Left,
            Width = 200 * hpPercent,
            Background = new SolidColorBrush(accentColor)
        };

        var hpContainer = new Grid();
        hpContainer.Children.Add(hpBg);
        hpContainer.Children.Add(hpFill);

        var hpLabel = new TextBlock
        {
            Text = $"HP: {account.Hp}/{account.MaxHp}",
            Foreground = new SolidColorBrush(Color.FromArgb(180, 255, 255, 255)),
            FontSize = 10,
            Margin = new Thickness(0, 1, 0, 0)
        };

        panel.Children.Add(nameLabel);
        panel.Children.Add(hpContainer);
        panel.Children.Add(hpLabel);

        return new Border
        {
            BorderBrush = new SolidColorBrush(Color.FromArgb(60, accentColor.R, accentColor.G, accentColor.B)),
            BorderThickness = new Thickness(0, 0, 0, 1),
            Padding = new Thickness(0, 0, 0, 4),
            Child = panel
        };
    }

    private static Color ParseColor(string hex)
    {
        try
        {
            hex = hex.TrimStart('#');
            if (hex.Length == 6)
            {
                byte r = Convert.ToByte(hex[..2], 16);
                byte g = Convert.ToByte(hex[2..4], 16);
                byte b = Convert.ToByte(hex[4..6], 16);
                return Color.FromRgb(r, g, b);
            }
        }
        catch { }
        return Color.FromRgb(79, 142, 247);
    }
}
