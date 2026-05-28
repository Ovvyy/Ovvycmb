using System.Windows;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using Microsoft.Web.WebView2.Core;
using Ovvycmb.App.Tray;
using Ovvycmb.Core.Configuration;
using Ovvycmb.Overlay;

namespace Ovvycmb.App;

public partial class MainWindow : Window
{
    private readonly AppHost _appHost;
    private readonly AppConfiguration _config;
    private readonly OverlayService _overlayService;
    private readonly ILogger<MainWindow> _logger;
    private readonly SystemTrayService _trayService;
    private OverlayWindow? _overlayWindow;

    public MainWindow(
        AppHost appHost,
        AppConfiguration config,
        OverlayService overlayService,
        SystemTrayService trayService,
        ILogger<MainWindow> logger)
    {
        _appHost = appHost;
        _config = config;
        _overlayService = overlayService;
        _trayService = trayService;
        _logger = logger;

        InitializeComponent();
        Loaded += OnLoaded;
        Closing += OnClosing;
        StateChanged += OnStateChanged;

        _trayService.ShowWindowRequested += (_, _) => ShowFromTray();
        _trayService.ExitRequested += (_, _) => ForceClose();
        _trayService.Initialize(this);
    }

    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        try
        {
            // Initialize WebView2
            var env = await CoreWebView2Environment.CreateAsync(
                null,
                Path.Combine(_config.DataDirectory, "webview2-cache"));

            await WebView.EnsureCoreWebView2Async(env);

            WebView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
            WebView.CoreWebView2.Settings.AreDevToolsEnabled = false;
            WebView.CoreWebView2.Settings.IsZoomControlEnabled = false;
            WebView.CoreWebView2.Settings.AreBrowserAcceleratorKeysEnabled = false;

            // Inject bridge script for C# <-> React communication
            await WebView.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync(GetBridgeScript());

            WebView.CoreWebView2.NavigationCompleted += OnNavigationCompleted;
            WebView.Source = new Uri(_appHost.FrontendUrl);

            _logger.LogInformation("WebView2 initialized, loading {Url}", _appHost.FrontendUrl);

            // Initialize overlay
            _overlayWindow = new OverlayWindow(Microsoft.Extensions.Logging.Abstractions.NullLogger<OverlayWindow>.Instance);
            _overlayWindow.Owner = this;
            _overlayService.SetWindow(_overlayWindow);
            _overlayWindow.Show();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize WebView2");
            MessageBox.Show($"Failed to initialize UI: {ex.Message}", "Ovvycmb Error",
                MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void OnNavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
    {
        Dispatcher.Invoke(() => LoadingOverlay.Visibility = Visibility.Collapsed);
        _logger.LogInformation("React UI loaded");
    }

    private static string GetBridgeScript() => """
        window.__OVVYCMB__ = {
            version: '1.0.0',
            apiUrl: window.location.origin + '/api',
            wsUrl: window.location.origin + '/hub',
            platform: 'windows'
        };
        """;

    private void TitleBar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        if (e.ClickCount == 2)
            MaximizeBtn_Click(sender, e);
        else
            DragMove();
    }

    private void MinimizeBtn_Click(object sender, RoutedEventArgs e) =>
        WindowState = WindowState.Minimized;

    private void MaximizeBtn_Click(object sender, RoutedEventArgs e) =>
        WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;

    private void CloseBtn_Click(object sender, RoutedEventArgs e)
    {
        Hide();
        _trayService.ShowBalloon("Ovvycmb", "Running in background. Right-click tray icon to exit.", 2000);
    }

    private void OnClosing(object? sender, System.ComponentModel.CancelEventArgs e)
    {
        if (!_forceClose)
        {
            e.Cancel = true;
            Hide();
        }
    }

    private void OnStateChanged(object? sender, EventArgs e)
    {
        if (WindowState == WindowState.Minimized && _config.StartMinimized)
            Hide();
    }

    private bool _forceClose;

    private void ForceClose()
    {
        _forceClose = true;
        _trayService.Dispose();
        Close();
        System.Windows.Application.Current.Shutdown();
    }

    private void ShowFromTray()
    {
        Show();
        WindowState = WindowState.Normal;
        Activate();
        Focus();
    }
}
