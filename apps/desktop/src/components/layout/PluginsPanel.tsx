import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Puzzle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  official: boolean;
}

export function PluginsPanel() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);

  useEffect(() => {
    invoke<Plugin[]>("list_plugins").then(setPlugins).catch(console.error);
  }, []);

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div>
        <h1 className="text-lg font-semibold">Plugins</h1>
        <p className="text-sm text-muted-foreground">
          {plugins.filter((p) => p.enabled).length} / {plugins.length} plugin(s) actif(s)
        </p>
      </div>

      <div className="space-y-2">
        {plugins.map((plugin) => (
          <div key={plugin.id} className="glass rounded-xl p-3 flex items-center gap-3 hover:bg-card/60 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <Puzzle className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{plugin.name}</p>
                {plugin.official && (
                  <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">Officiel</span>
                )}
                <span className="text-xs text-muted-foreground">v{plugin.version}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{plugin.description}</p>
            </div>
            <div className="flex-shrink-0">
              {plugin.enabled ? (
                <CheckCircle2 className="w-4.5 h-4.5 text-green-400" />
              ) : (
                <XCircle className="w-4.5 h-4.5 text-muted-foreground" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto glass rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Marketplace à venir — installez des plugins communautaires
        </p>
      </div>
    </div>
  );
}
