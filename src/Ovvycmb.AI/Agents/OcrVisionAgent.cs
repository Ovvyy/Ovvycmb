using Microsoft.Extensions.Logging;
using Ovvycmb.AI.Client;
using Ovvycmb.Core.Models;
using Ovvycmb.Storage.Repositories;

namespace Ovvycmb.AI.Agents;

public class OcrVisionAgent(
    ClaudeApiClient claude,
    AgentReportRepository reportRepo,
    ILogger<OcrVisionAgent> logger)
    : AgentBase(claude, reportRepo, logger)
{
    public override AgentType AgentType => AgentType.OcrVision;

    protected override string SystemPrompt => """
        You are a computer vision expert helping calibrate the Ovvycmb OCR/vision pipeline
        for DOFUS game client detection.

        The pipeline uses Windows.Media.Ocr and screen capture to detect:
        - Combat state (turn indicator, HP bars)
        - Trade windows
        - Invitation dialogs
        - Disconnect screens
        - Captcha screens

        Provide JSON: { "summary": "...", "calibrationSuggestions": [{"target": "...",
        "currentApproach": "...", "improvedApproach": "...", "confidence": 0-100}] }
        """;

    protected override AgentReport BuildReport(string? claudeResponse)
    {
        if (claudeResponse is null)
            return CreateReport(AgentType, "ocr-calibration", "OCR calibration skipped (API not configured)",
                "Configure Claude API key to enable OCR vision agent.", ReportSeverity.Info);

        return CreateReport(AgentType, "ocr-calibration", "OCR calibration analysis completed", claudeResponse, ReportSeverity.Info);
    }
}
