using Microsoft.EntityFrameworkCore;
using Ovvycmb.Core.Models;

namespace Ovvycmb.Storage;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<AccountGroup> AccountGroups => Set<AccountGroup>();
    public DbSet<LayoutProfile> LayoutProfiles => Set<LayoutProfile>();
    public DbSet<DomainEvent> Events => Set<DomainEvent>();
    public DbSet<HotkeyBinding> HotkeyBindings => Set<HotkeyBinding>();
    public DbSet<AgentReport> AgentReports => Set<AgentReport>();
    public DbSet<PluginManifest> Plugins => Set<PluginManifest>();
    public DbSet<AppSetting> Settings => Set<AppSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).IsRequired().HasMaxLength(100);
            e.Property(x => x.CharacterName).HasMaxLength(100);
            e.Property(x => x.ColorTag).HasMaxLength(20);
            e.Property(x => x.Server).HasMaxLength(50);
            e.Property(x => x.WindowHandle).HasConversion<long>();
            e.HasOne(x => x.Group).WithMany(x => x.Accounts).HasForeignKey(x => x.GroupId).IsRequired(false);
            e.HasIndex(x => x.ProcessId);
            e.HasIndex(x => x.Status);
        });

        modelBuilder.Entity<AccountGroup>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<LayoutProfile>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).IsRequired().HasMaxLength(100);
            e.Property(x => x.Layouts).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<WindowLayout>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new());
        });

        modelBuilder.Entity<DomainEvent>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Timestamp);
            e.HasIndex(x => x.AccountId);
            e.HasIndex(x => x.EventType);
            e.HasOne(x => x.Account).WithMany(x => x.Events).HasForeignKey(x => x.AccountId).IsRequired(false);
        });

        modelBuilder.Entity<HotkeyBinding>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.KeyCombo).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<AgentReport>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.AgentType);
            e.HasIndex(x => x.CreatedAt);
            e.Property(x => x.Recommendations).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new());
            e.Property(x => x.Metadata).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new());
        });

        modelBuilder.Entity<PluginManifest>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.SupportedGames).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<GameType>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new());
            e.Property(x => x.Capabilities).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new());
        });

        modelBuilder.Entity<AppSetting>(e =>
        {
            e.HasKey(x => x.Key);
        });
    }
}

public class AppSetting
{
    public string Key { get; set; } = string.Empty;
    public string? Value { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
