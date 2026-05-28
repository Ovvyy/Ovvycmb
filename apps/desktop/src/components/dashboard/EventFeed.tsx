import { useState, useEffect, useRef } from "react";
import { Activity, Sword, ArrowLeftRight, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeedEvent {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  severity: "info" | "warning" | "critical";
}

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  combat: Sword,
  trade: ArrowLeftRight,
  disconnect: WifiOff,
  connect: Wifi,
  default: Activity,
};

export function EventFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="glass rounded-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50 flex-shrink-0">
        <Activity className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Événements
        </span>
        <span className="ml-auto text-xs text-muted-foreground">{events.length}</span>
      </div>

      {/* Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1">
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Activity className="w-6 h-6 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">Aucun événement</p>
            </div>
          ) : (
            events.map((event) => {
              const Icon = EVENT_ICONS[event.type] ?? EVENT_ICONS.default;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-lg text-xs",
                    event.severity === "critical" && "bg-red-500/10",
                    event.severity === "warning" && "bg-yellow-500/10",
                    event.severity === "info" && "bg-muted/50"
                  )}
                >
                  <Icon className={cn(
                    "w-3 h-3 mt-0.5 flex-shrink-0",
                    event.severity === "critical" ? "text-red-400" :
                    event.severity === "warning" ? "text-yellow-400" :
                    "text-muted-foreground"
                  )} />
                  <div className="min-w-0">
                    <p className="text-foreground/80 leading-tight break-words">{event.message}</p>
                    <p className="text-muted-foreground/60 mt-0.5">
                      {event.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
