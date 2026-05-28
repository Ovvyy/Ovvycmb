import { Window } from "@tauri-apps/api/window";
import { Minus, Square, X, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function TitleBar() {
  const appWindow = Window.getCurrent();

  return (
    <div className="flex items-center h-10 px-4 drag-region border-b border-border/50 bg-card/80 backdrop-blur-sm flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 no-drag">
        <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
          <Layers className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground/90 tracking-tight">
          Ovvycmb
        </span>
        <span className="text-xs text-muted-foreground font-medium px-1.5 py-0.5 bg-muted rounded">
          0.1.0
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Window controls */}
      <div className="flex items-center gap-1 no-drag">
        <button
          onClick={() => appWindow.minimize()}
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            "transition-colors duration-150"
          )}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            "transition-colors duration-150"
          )}
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={() => appWindow.hide()}
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center",
            "text-muted-foreground hover:text-red-400 hover:bg-red-400/10",
            "transition-colors duration-150"
          )}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
