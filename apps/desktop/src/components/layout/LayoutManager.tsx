import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Plus, Play, Trash2, Monitor, Grid } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";

const PRESETS = [
  { id: "grid_2x2", label: "Grille 2×2", icon: "⊞", max: 4 },
  { id: "grid_2x4", label: "Grille 2×4", icon: "⊟", max: 8 },
  { id: "horizontal", label: "Horizontal", icon: "☰", max: 8 },
  { id: "vertical", label: "Vertical", icon: "≡", max: 8 },
];

export function LayoutManager() {
  const { profiles, monitors, fetchProfiles, fetchMonitors, applyProfile, accounts } = useAppStore();
  const [selectedPreset, setSelectedPreset] = useState("grid_2x2");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfiles();
    fetchMonitors();
  }, []);

  const handleApplyPreset = async () => {
    setSaving(true);
    try {
      const layouts = await invoke("get_preset_layouts", {
        count: accounts.length,
        preset: selectedPreset,
      });
      // Save as profile then apply
      const profile = await invoke("save_profile", {
        name: `${PRESETS.find((p) => p.id === selectedPreset)?.label} (Auto)`,
        monitorCount: monitors.length || 1,
      });
      if (profile && (profile as any).id) {
        await applyProfile((profile as any).id);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div>
        <h1 className="text-lg font-semibold">Layout Manager</h1>
        <p className="text-sm text-muted-foreground">
          {monitors.length} écran(s) • {accounts.length} compte(s)
        </p>
      </div>

      {/* Monitor info */}
      <div className="grid grid-cols-2 gap-3">
        {monitors.map((m) => (
          <div key={m.index} className="glass rounded-xl p-3 flex items-center gap-3">
            <Monitor className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{m.name}</p>
              <p className="text-xs text-muted-foreground">
                {m.bounds.width}×{m.bounds.height} · {m.dpi} DPI
                {m.is_primary && " · Principal"}
              </p>
            </div>
          </div>
        ))}
        {monitors.length === 0 && (
          <div className="glass rounded-xl p-3 col-span-2 text-sm text-muted-foreground text-center">
            Cliquez sur "Scanner fenêtres" depuis le dashboard
          </div>
        )}
      </div>

      {/* Preset selection */}
      <div>
        <h2 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
          Disposition automatique
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset.id)}
              className={cn(
                "glass rounded-xl p-3 flex flex-col items-center gap-2 transition-all",
                selectedPreset === preset.id
                  ? "border-primary/60 bg-primary/10 ring-1 ring-primary/30"
                  : "hover:border-border hover:bg-card/60"
              )}
            >
              <span className="text-2xl">{preset.icon}</span>
              <span className="text-xs font-medium text-center">{preset.label}</span>
              <span className="text-xs text-muted-foreground">Max {preset.max}</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleApplyPreset}
          disabled={saving || accounts.length === 0}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Play className="w-4 h-4" />
          {saving ? "Application..." : "Appliquer la disposition"}
        </button>
      </div>

      {/* Saved profiles */}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
          Profils sauvegardés
        </h2>
        <div className="space-y-2">
          {profiles.map((profile) => (
            <motion.div
              key={profile.id}
              layout
              className="glass rounded-xl p-3 flex items-center justify-between group hover:bg-card/60 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{profile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {profile.monitor_count} écran(s) · {profile.layouts.length} fenêtres
                  {profile.is_default && " · Défaut"}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => applyProfile(profile.id)}
                  className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
          {profiles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun profil — appliquez une disposition pour en créer un
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
