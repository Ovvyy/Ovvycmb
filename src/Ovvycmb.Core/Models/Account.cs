namespace Ovvycmb.Core.Models;

public enum GameType { DofusUnity, DofusRetro, Wakfu }
public enum AccountStatus { Offline, Connected, InCombat, Trading, Idle, Error }
public enum CharacterClass { Unknown, Cra, Ecaflip, Eniripsa, Enutrof, Feca, Iop, Osamodas, Pandawa, Rogues, Sacrieur, Sadida, Sram, Xelor, Foggernaut, Eliotrope, Huppermage, Ouginak, Forgelance }

public class Account
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string CharacterName { get; set; } = string.Empty;
    public GameType GameType { get; set; }
    public AccountStatus Status { get; set; } = AccountStatus.Offline;
    public int? ProcessId { get; set; }
    public nint WindowHandle { get; set; }
    public int Hp { get; set; }
    public int MaxHp { get; set; }
    public int Initiative { get; set; }
    public int Level { get; set; }
    public CharacterClass Class { get; set; } = CharacterClass.Unknown;
    public string Server { get; set; } = string.Empty;
    public string ColorTag { get; set; } = "#4F8EF7";
    public Guid? GroupId { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFocused { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public AccountGroup? Group { get; set; }
    public ICollection<DomainEvent> Events { get; set; } = [];
}

public class AccountGroup
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#4F8EF7";
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Account> Accounts { get; set; } = [];
}
