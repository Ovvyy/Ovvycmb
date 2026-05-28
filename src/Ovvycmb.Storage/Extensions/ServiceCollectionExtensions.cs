using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Ovvycmb.Core.Configuration;
using Ovvycmb.Core.Interfaces;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.Storage.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddStorage(this IServiceCollection services, AppConfiguration config)
    {
        Directory.CreateDirectory(config.DataDirectory);

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite($"Data Source={config.DatabasePath}")
                   .EnableDetailedErrors(false)
                   .EnableSensitiveDataLogging(false));

        services.AddScoped<IRepository<Account>, AccountRepository>();
        services.AddScoped<AccountRepository>();
        services.AddScoped<IRepository<LayoutProfile>, LayoutRepository>();
        services.AddScoped<LayoutRepository>();
        services.AddScoped<IRepository<DomainEvent>, EventRepository>();
        services.AddScoped<EventRepository>();
        services.AddScoped<IRepository<AgentReport>, AgentReportRepository>();
        services.AddScoped<AgentReportRepository>();
        services.AddScoped<SettingsRepository>();

        return services;
    }

    public static async Task MigrateAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureCreatedAsync();
    }
}
