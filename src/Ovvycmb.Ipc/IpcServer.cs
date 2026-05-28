using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Ovvycmb.Core.Configuration;
using Ovvycmb.Core.Events;
using Ovvycmb.Core.Interfaces;
using Ovvycmb.Core.Models;
using Ovvycmb.Ipc.DTOs;
using Ovvycmb.Ipc.Hubs;
using Ovvycmb.Services;
using Ovvycmb.Storage;
using Ovvycmb.Storage.Repositories;
using Prometheus;

namespace Ovvycmb.Ipc;

public static class IpcServer
{
    public static WebApplication CreateApp(IServiceProvider rootServices, AppConfiguration config)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls($"http://{config.IpcHost}:{config.IpcPort}");

        builder.Services.AddSignalR(opts =>
        {
            opts.EnableDetailedErrors = true;
            opts.MaximumReceiveMessageSize = 1024 * 1024;
        });

        builder.Services.AddCors(opts => opts.AddDefaultPolicy(p =>
            p.SetIsOriginAllowed(_ => true).AllowAnyMethod().AllowAnyHeader().AllowCredentials()));

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(c => c.SwaggerDoc("v1", new() { Title = "Ovvycmb API", Version = "v1" }));

        // Singletons shared from root container
        builder.Services.AddSingleton(rootServices.GetRequiredService<IEventBus>());
        builder.Services.AddSingleton(rootServices.GetRequiredService<IWindowManager>());
        builder.Services.AddSingleton(config);

        // Own EF Core + scoped repositories (proper per-request scope)
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite($"Data Source={config.DatabasePath}"));

        builder.Services.AddScoped<AccountRepository>();
        builder.Services.AddScoped<LayoutRepository>();
        builder.Services.AddScoped<EventRepository>();
        builder.Services.AddScoped<AgentReportRepository>();
        builder.Services.AddScoped<SettingsRepository>();
        builder.Services.AddScoped<AccountService>();
        builder.Services.AddScoped<LayoutService>();

        var app = builder.Build();

        app.UseCors();
        app.UseSwagger();
        app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Ovvycmb API v1"));
        app.UseRouting();
        app.UseHttpMetrics();
        app.MapMetrics("/metrics");
        app.MapHub<OvvycmbHub>("/hub");

        MapAccountEndpoints(app);
        MapLayoutEndpoints(app);
        MapSystemEndpoints(app);
        MapEventEndpoints(app);
        MapAgentEndpoints(app);

        return app;
    }

    private static void MapAccountEndpoints(WebApplication app)
    {
        var group = app.MapGroup("/api/accounts").WithTags("Accounts");

        group.MapGet("/", async (AccountService svc, CancellationToken ct) =>
        {
            var accounts = await svc.GetAllAsync(ct);
            return Results.Ok(accounts.Select(AccountDto.FromModel));
        });

        group.MapGet("/{id:guid}", async (Guid id, AccountService svc, CancellationToken ct) =>
        {
            var account = await svc.GetByIdAsync(id, ct);
            return account is null ? Results.NotFound() : Results.Ok(AccountDto.FromModel(account));
        });

        group.MapPost("/", async (CreateAccountRequest req, AccountService svc, CancellationToken ct) =>
        {
            if (!Enum.TryParse<GameType>(req.GameType, out var gameType))
                return Results.BadRequest("Invalid game type");
            var account = new Account
            {
                Name = req.Name,
                CharacterName = req.CharacterName,
                GameType = gameType,
                Server = req.Server ?? string.Empty,
                ColorTag = req.ColorTag
            };
            var created = await svc.CreateAsync(account, ct);
            return Results.Created($"/api/accounts/{created.Id}", AccountDto.FromModel(created));
        });

        group.MapPut("/{id:guid}", async (Guid id, UpdateAccountRequest req, AccountService svc, CancellationToken ct) =>
        {
            var account = await svc.GetByIdAsync(id, ct);
            if (account is null) return Results.NotFound();
            if (req.Name is not null) account.Name = req.Name;
            if (req.CharacterName is not null) account.CharacterName = req.CharacterName;
            if (req.Hp.HasValue) account.Hp = req.Hp.Value;
            if (req.MaxHp.HasValue) account.MaxHp = req.MaxHp.Value;
            if (req.ColorTag is not null) account.ColorTag = req.ColorTag;
            if (req.IsActive.HasValue) account.IsActive = req.IsActive.Value;
            var updated = await svc.UpdateAsync(account, ct);
            return Results.Ok(AccountDto.FromModel(updated));
        });

        group.MapDelete("/{id:guid}", async (Guid id, AccountService svc, CancellationToken ct) =>
        {
            await svc.DeleteAsync(id, ct);
            return Results.NoContent();
        });

        group.MapPost("/{id:guid}/focus", async (Guid id, AccountService svc, CancellationToken ct) =>
        {
            var result = await svc.FocusAsync(id, ct);
            return Results.Ok(new { success = result });
        });
    }

    private static void MapLayoutEndpoints(WebApplication app)
    {
        var group = app.MapGroup("/api/layouts").WithTags("Layouts");

        group.MapGet("/", async (LayoutService svc, CancellationToken ct) =>
        {
            var layouts = await svc.GetAllAsync(ct);
            return Results.Ok(layouts.Select(LayoutProfileDto.FromModel));
        });

        group.MapPost("/", async (CreateLayoutRequest req, LayoutService svc, CancellationToken ct) =>
        {
            var profile = new LayoutProfile
            {
                Name = req.Name,
                Description = req.Description,
                Hotkey = req.Hotkey,
                MonitorCount = req.MonitorCount
            };
            var created = await svc.CreateAsync(profile, ct);
            return Results.Created($"/api/layouts/{created.Id}", LayoutProfileDto.FromModel(created));
        });

        group.MapDelete("/{id:guid}", async (Guid id, LayoutService svc, CancellationToken ct) =>
        {
            await svc.DeleteAsync(id, ct);
            return Results.NoContent();
        });

        group.MapPost("/{id:guid}/apply", async (Guid id, LayoutService svc, CancellationToken ct) =>
        {
            var result = await svc.ApplyProfileAsync(id, ct);
            return Results.Ok(new { success = result });
        });

        group.MapPost("/auto-generate", async (int? monitorIndex, LayoutService svc, CancellationToken ct) =>
        {
            var profile = await svc.GenerateAutoLayoutAsync(monitorIndex ?? 0, ct);
            return Results.Ok(LayoutProfileDto.FromModel(profile));
        });
    }

    private static void MapSystemEndpoints(WebApplication app)
    {
        var group = app.MapGroup("/api/system").WithTags("System");

        group.MapGet("/health", () => Results.Ok(new
        {
            status = "healthy",
            version = "1.0.0",
            timestamp = DateTime.UtcNow
        }));

        group.MapGet("/monitors", async (IWindowManager wm, CancellationToken ct) =>
            Results.Ok(await wm.GetMonitorsAsync(ct)));

        group.MapGet("/clients", async (IWindowManager wm, CancellationToken ct) =>
            Results.Ok(await wm.DetectGameClientsAsync(ct)));
    }

    private static void MapEventEndpoints(WebApplication app)
    {
        var group = app.MapGroup("/api/events").WithTags("Events");

        group.MapGet("/", async (EventRepository repo, CancellationToken ct) =>
            Results.Ok(await repo.GetRecentAsync(50, ct)));
    }

    private static void MapAgentEndpoints(WebApplication app)
    {
        var group = app.MapGroup("/api/agents").WithTags("Agents");

        group.MapGet("/reports", async (AgentReportRepository repo, CancellationToken ct) =>
            Results.Ok(await repo.GetRecentAsync(20, ct)));

        group.MapPost("/run", async (
            AgentRunRequest req,
            IEventBus eventBus,
            CancellationToken ct) =>
        {
            if (!Enum.TryParse<AgentType>(req.AgentType, out var agentType))
                return Results.BadRequest("Invalid agent type");

            await eventBus.PublishAsync(DomainEvent.Create(EventType.AgentStarted,
                message: $"Agent {agentType} run requested via API"), ct);

            return Results.Accepted("/api/agents/reports",
                new { agentType = agentType.ToString(), status = "queued" });
        });
    }
}

public record AgentRunRequest(string AgentType, string? Context = null);
