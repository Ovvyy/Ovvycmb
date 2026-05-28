import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AccountStatus, GameType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function statusColor(status: AccountStatus): string {
  const map: Record<AccountStatus, string> = {
    Online: "text-green-400",
    InCombat: "text-red-400",
    Trading: "text-blue-400",
    Idle: "text-yellow-400",
    Offline: "text-gray-500",
    Connecting: "text-blue-300",
    Disconnected: "text-orange-400",
    Crashed: "text-red-600",
    WaitingCaptcha: "text-purple-400",
  };
  return map[status] ?? "text-gray-400";
}

export function statusDot(status: AccountStatus): string {
  const map: Record<AccountStatus, string> = {
    Online: "bg-green-400",
    InCombat: "bg-red-400 animate-pulse",
    Trading: "bg-blue-400",
    Idle: "bg-yellow-400",
    Offline: "bg-gray-600",
    Connecting: "bg-blue-300 animate-pulse",
    Disconnected: "bg-orange-400",
    Crashed: "bg-red-600",
    WaitingCaptcha: "bg-purple-400 animate-pulse",
  };
  return map[status] ?? "bg-gray-500";
}

export function gameTypeLabel(type: GameType): string {
  const map: Record<GameType, string> = {
    dofus_unity: "DOFUS",
    dofus_retro: "DOFUS Retro",
    wakfu: "WAKFU",
  };
  return map[type];
}

export function gameTypeColor(type: GameType): string {
  const map: Record<GameType, string> = {
    dofus_unity: "text-amber-400",
    dofus_retro: "text-orange-600",
    wakfu: "text-emerald-500",
  };
  return map[type];
}

export function hpColor(percent: number): string {
  if (percent > 50) return "bg-green-500";
  if (percent > 25) return "bg-yellow-500";
  return "bg-red-500";
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}
