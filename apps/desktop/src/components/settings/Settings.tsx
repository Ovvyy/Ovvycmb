import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Save, Sliders, Keyboard, Eye, Bot, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "general" | "overlay" | "hotkeys" | "ai" | "security";

const TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "general", label: "Général", icon: Sliders },
  { id: "overlay", label: "Overlay", icon: Eye },
  { id: "hotkeys", label: "Raccourcis", icon: Keyboard },
  { id: "ai", label: "Agents IA", icon: Bot },
  { id: "security", label: "Sécurité", icon: Shield },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    invoke("get_config").then(setConfig).catch(console.error);
  }, []);

  const updateConfig = async (key: string, value: unknown) => {
    await invoke("update_config", { key, value });
    setConfig((c: any) => ({ ...c }));
  };

  return (
    <div className="h-full flex gap-0 overflow-hidden">
      {/* Tab sidebar */}
      <div className="w-44 border-r border-border/50 p-3 flex-shrink-0 space-y-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === "general" && (
          <GeneralSettings config={config} onUpdate={updateConfig} />
        )}
        {activeTab === "overlay" && (
          <OverlaySettings config={config} onUpdate={updateConfig} />
        )}
        {activeTab === "hotkeys" && <HotkeySettings config={config} />}
        {activeTab === "ai" && <AiSettings config={config} onUpdate={updateConfig} />}
        {activeTab === "security" && <SecuritySettings />}
      </div>
    </div>
  );
}

function GeneralSettings({ config, onUpdate }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Paramètres généraux</h2>
      <SettingRow
        label="Réduire dans la barre système"
        description="Fermer ne quitte pas l'application"
      >
        <Toggle
          checked={config?.general?.minimize_to_tray ?? true}
          onChange={(v) => onUpdate("general.minimize_to_tray", v)}
        />
      </SettingRow>
      <SettingRow
        label="Démarrer avec Windows"
        description="Lancer automatiquement au démarrage"
      >
        <Toggle
          checked={config?.general?.start_with_windows ?? false}
          onChange={(v) => onUpdate("general.start_with_windows", v)}
        />
      </SettingRow>
    </div>
  );
}

function OverlaySettings({ config, onUpdate }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Overlay</h2>
      <SettingRow label="Activer l'overlay" description="Afficher l'overlay GPU sur les fenêtres">
        <Toggle
          checked={config?.overlay?.enabled ?? true}
          onChange={(v) => onUpdate("overlay.enabled", v)}
        />
      </SettingRow>
      <SettingRow label="Opacité" description="Transparence de l'overlay (0-100%)">
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          defaultValue={config?.overlay?.opacity ?? 0.85}
          onChange={(e) => onUpdate("overlay.opacity", parseFloat(e.target.value))}
          className="w-32"
        />
      </SettingRow>
    </div>
  );
}

function HotkeySettings({ config }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Raccourcis clavier</h2>
      {[
        { key: "focus_next", label: "Focus compte suivant", default: config?.hotkeys?.focus_next ?? "Alt+Tab" },
        { key: "focus_prev", label: "Focus compte précédent", default: config?.hotkeys?.focus_prev ?? "Alt+Shift+Tab" },
        { key: "apply_layout", label: "Appliquer le layout", default: config?.hotkeys?.apply_layout ?? "Ctrl+Alt+L" },
        { key: "toggle_overlay", label: "Toggle overlay", default: config?.hotkeys?.toggle_overlay ?? "Ctrl+Alt+O" },
        { key: "emergency_stop", label: "Arrêt d'urgence", default: config?.hotkeys?.emergency_stop ?? "Ctrl+Alt+X" },
      ].map((item) => (
        <div key={item.key} className="flex items-center justify-between py-2">
          <span className="text-sm">{item.label}</span>
          <kbd className="text-xs bg-muted border border-border px-2 py-1 rounded font-mono">
            {item.default}
          </kbd>
        </div>
      ))}
    </div>
  );
}

function AiSettings({ config, onUpdate }: any) {
  const [apiKey, setApiKey] = useState("");

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Agents IA</h2>
      <SettingRow label="Activer les agents IA" description="Nécessite une clé API Anthropic">
        <Toggle
          checked={config?.ai?.enabled ?? false}
          onChange={(v) => onUpdate("ai.enabled", v)}
        />
      </SettingRow>
      <div className="space-y-1">
        <label className="text-sm font-medium">Clé API Anthropic</label>
        <p className="text-xs text-muted-foreground">Stockée de façon sécurisée dans le système</p>
        <input
          type="password"
          placeholder="sk-ant-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring font-mono"
        />
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Sécurité & Confidentialité</h2>
      <div className="glass rounded-xl p-4 space-y-2">
        <p className="text-sm font-medium text-green-400">✓ Serveur IPC local uniquement</p>
        <p className="text-sm font-medium text-green-400">✓ Aucune injection de paquets réseau</p>
        <p className="text-sm font-medium text-green-400">✓ Aucun contournement anti-triche</p>
        <p className="text-sm font-medium text-green-400">✓ Plugins isolés via sandbox WASM</p>
        <p className="text-sm font-medium text-green-400">✓ Données stockées localement uniquement</p>
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-10 h-5.5 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
