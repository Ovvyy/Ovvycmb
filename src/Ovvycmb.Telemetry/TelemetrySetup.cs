using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Ovvycmb.Core.Configuration;
using Serilog;
using Serilog.Events;

namespace Ovvycmb.Telemetry;

public static class TelemetrySetup
{
    public static IHostBuilder UseOvvycmbTelemetry(this IHostBuilder builder, AppConfiguration config)
    {
        Directory.CreateDirectory(config.LogDirectory);
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("System", LogEventLevel.Warning)
            .Enrich.FromLogContext()
            .Enrich.WithThreadId()
            .Enrich.WithEnvironmentName()
            .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}")
            .WriteTo.File(
                path: Path.Combine(config.LogDirectory, "ovvycmb-.log"),
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 7,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] [{ThreadId}] {SourceContext} {Message:lj}{NewLine}{Exception}")
            .CreateLogger();

        builder.UseSerilog();
        return builder;
    }

    public static IServiceCollection AddOvvycmbTelemetry(this IServiceCollection services)
    {
        services.AddSingleton<OvvycmbMetrics>();
        return services;
    }
}
