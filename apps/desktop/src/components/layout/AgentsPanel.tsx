import { useAppStore } from '@/stores/appStore'
import { Bot, Play, FileText } from 'lucide-react'
import type { AgentType } from '@/types'

const AGENTS: { type: AgentType; label: string; description: string; icon: string }[] = [
  { type: 'Architect', label: 'Architect', description: 'Reviews architecture and technical debt', icon: '🏛' },
  { type: 'Security', label: 'Security', description: 'Scans for vulnerabilities and unsafe patterns', icon: '🔒' },
  { type: 'Performance', label: 'Performance', description: 'Profiles CPU/RAM and detects bottlenecks', icon: '⚡' },
  { type: 'QA', label: 'QA', description: 'Generates test strategies and edge cases', icon: '🧪' },
  { type: 'CodeReviewer', label: 'Code Review', description: 'Reviews code quality and conventions', icon: '👁' },
  { type: 'Refactor', label: 'Refactor', description: 'Proposes structural improvements', icon: '🔧' },
  { type: 'OcrVision', label: 'OCR Vision', description: 'Calibrates the screen detection pipeline', icon: '👀' },
]

export function AgentsPanel() {
  const { agentReports, runningAgents, setAgentRunning, setAgentReports } = useAppStore()

  const runAgent = async (agentType: AgentType) => {
    setAgentRunning(agentType, true)
    try {
      await fetch(`/api/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentType }),
      })
    } finally {
      setAgentRunning(agentType, false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bot size={20} className="text-brand-400" />
        <div>
          <h1 className="text-xl font-semibold">AI Agents</h1>
          <p className="text-sm text-white/40 mt-0.5">Claude-powered analysis agents</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {AGENTS.map(agent => (
          <div key={agent.type} className="glass rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{agent.icon}</span>
                <div>
                  <p className="font-medium text-sm">{agent.label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{agent.description}</p>
                </div>
              </div>
              <button
                onClick={() => runAgent(agent.type)}
                disabled={runningAgents.has(agent.type)}
                className="p-2 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 transition-colors disabled:opacity-50"
                title="Run agent"
              >
                {runningAgents.has(agent.type) ? (
                  <div className="w-3 h-3 border border-brand-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play size={12} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {agentReports.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
            <FileText size={14} />
            Recent Reports
          </h2>
          <div className="space-y-2">
            {agentReports.slice(0, 5).map(report => (
              <div key={report.id} className="glass rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{report.agentType} · {report.reportType}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    report.severity === 'Critical' ? 'bg-accent-danger/20 text-accent-danger' :
                    report.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    report.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>{report.severity}</span>
                </div>
                <p className="text-xs text-white/60">{report.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
