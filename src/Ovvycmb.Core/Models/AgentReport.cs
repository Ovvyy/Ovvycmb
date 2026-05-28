namespace Ovvycmb.Core.Models;

public enum AgentType { Architect, Security, Performance, QA, CodeReviewer, Refactor, OcrVision }
public enum ReportSeverity { Info, Low, Medium, High, Critical }

public class AgentReport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public AgentType AgentType { get; set; }
    public string ReportType { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public ReportSeverity Severity { get; set; } = ReportSeverity.Info;
    public List<string> Recommendations { get; set; } = [];
    public Dictionary<string, object> Metadata { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
