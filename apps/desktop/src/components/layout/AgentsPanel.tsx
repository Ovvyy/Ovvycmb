import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Bot, Play, ChevronDown, ChevronUp, AlertTriangle, Info, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AgentReport } from "@/types";

const AGENTS = [
  { id: "architect", name: "Architect", description: "Analyse l'architecture et la dette technique", color: "text-blue-400" },
  { id: "security", name: "Security", description: "Scan de vulnérabilités et sécurité", color: "text-red-400" },
  { id: "performance", name: "Performance", description: "Profiling CPU/RAM et détection de leaks", color: "text-green-400" },
  { id: "qa", name: "QA", description: "Génération de tests et stress testing", color: "text-purple-400" },
  { id: "code_reviewer", name: "Code Reviewer", description: "Review qualité et conventions", color: "text-yellow-400" },
  { id: "refactor", name: "Refactor", description: "Suggestions d'améliorations structurelles", color: "text-orange-400" },
  { id: "ocr_vision", name: "OCR/Vision", description: "Calibration pipeline de détection", color: "text-teal-400" },
];

export function AgentsPanel() {
  const [running, setRunning] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, AgentReport>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const runAgent = async (agentId: string) => {
    setRunning(agentId);
    try {
      const report = await invoke<AgentReport>("run_agent", {
        agentId,
        args: {},
      });
      setReports((prev) => ({ ...prev, [agentId]: report }));
      setExpanded(agentId);
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-y-auto">
      <div>
        <h1 className="text-lg font-semibold">Agents IA</h1>
        <p className="text-sm text-muted-foreground">
          Système multi-agents d'analyse et de validation
        </p>
      </div>

      <div className="space-y-2">
        {AGENTS.map((agent) => {
          const report = reports[agent.id];
          const isExpanded = expanded === agent.id;
          const isRunning = running === agent.id;

          return (
            <div key={agent.id} className="glass rounded-xl overflow-hidden">
              <div className="p-3 flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center flex-shrink-0", agent.color)}>
                  <Bot className="w-4 h-4" style={{ color: "currentColor" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{agent.name}</p>
                    {report && (
                      <span className="text-xs px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded">
                        Rapport disponible
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  {report && (
                    <button
                      onClick={() => setExpanded(isExpanded ? null : agent.id)}
                      className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button
                    onClick={() => runAgent(agent.id)}
                    disabled={isRunning}
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                      isRunning
                        ? "bg-primary/20 text-primary animate-pulse"
                        : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    )}
                  >
                    {isRunning ? (
                      <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Report */}
              <AnimatePresence>
                {isExpanded && report && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border/50 p-3 space-y-3"
                  >
                    <p className="text-xs text-muted-foreground">{report.summary}</p>
                    {report.findings.map((f, i) => (
                      <div key={i} className={cn(
                        "flex items-start gap-2 p-2 rounded-lg text-xs",
                        f.severity === "Critical" && "bg-red-500/10",
                        f.severity === "Warning" && "bg-yellow-500/10",
                        (f.severity === "Info" || f.severity === "Suggestion") && "bg-muted/50"
                      )}>
                        {f.severity === "Critical" ? (
                          <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                        ) : f.severity === "Warning" ? (
                          <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Info className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold">{f.title}</p>
                          <p className="text-muted-foreground mt-0.5">{f.description}</p>
                          {f.suggestion && (
                            <p className="text-primary/80 mt-1">→ {f.suggestion}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
