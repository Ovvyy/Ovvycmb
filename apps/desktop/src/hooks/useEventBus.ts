import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";

export function useEventBus() {
  const { fetchAccounts } = useAppStore();

  useEffect(() => {
    // Connect to daemon WebSocket for real-time events
    const ws = new WebSocket("ws://127.0.0.1:7337/api/v1/ws");

    ws.onopen = () => {
      console.log("[EventBus] Connected to daemon");
    };

    ws.onmessage = (evt) => {
      try {
        const envelope = JSON.parse(evt.data);
        handleEvent(envelope.event, fetchAccounts);
      } catch {}
    };

    ws.onerror = () => {
      // Daemon not running — that's ok in dev
    };

    return () => ws.close();
  }, [fetchAccounts]);
}

function handleEvent(event: { type: string }, fetchAccounts: () => void) {
  switch (event.type) {
    case "account_status_changed":
    case "account_added":
    case "account_removed":
      fetchAccounts();
      break;
    default:
      break;
  }
}
