using Ovvycmb.Core.Models;

namespace Ovvycmb.Ipc.DTOs;

public record AccountDto(
    Guid Id, string Name, string CharacterName,
    string GameType, string Status,
    int? ProcessId, int Hp, int MaxHp,
    int Initiative, int Level, string Class,
    string Server, string ColorTag,
    Guid? GroupId, int SortOrder, bool IsActive, bool IsFocused,
    DateTime CreatedAt, DateTime UpdatedAt)
{
    public static AccountDto FromModel(Account a) => new(
        a.Id, a.Name, a.CharacterName,
        a.GameType.ToString(), a.Status.ToString(),
        a.ProcessId, a.Hp, a.MaxHp,
        a.Initiative, a.Level, a.Class.ToString(),
        a.Server, a.ColorTag,
        a.GroupId, a.SortOrder, a.IsActive, a.IsFocused,
        a.CreatedAt, a.UpdatedAt);
}

public record CreateAccountRequest(
    string Name, string CharacterName,
    string GameType, string? Server,
    string ColorTag = "#4F8EF7");

public record UpdateAccountRequest(
    string? Name, string? CharacterName,
    string? Status, int? Hp, int? MaxHp,
    int? Initiative, int? Level, string? ColorTag,
    bool? IsActive);
