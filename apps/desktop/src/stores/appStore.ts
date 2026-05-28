import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Account, AppView, LayoutProfile, MonitorInfo } from "@/types";

interface AppStore {
  // Navigation
  activeView: AppView;
  setActiveView: (view: AppView) => void;

  // Accounts
  accounts: Account[];
  fetchAccounts: () => Promise<void>;
  addAccount: (name: string, gameType: string) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  focusAccount: (id: string) => Promise<void>;

  // Layout
  profiles: LayoutProfile[];
  monitors: MonitorInfo[];
  fetchProfiles: () => Promise<void>;
  fetchMonitors: () => Promise<void>;
  applyProfile: (id: string) => Promise<void>;
  scanWindows: () => Promise<void>;

  // System
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  activeView: "dashboard",
  setActiveView: (view) => set({ activeView: view }),

  accounts: [],
  fetchAccounts: async () => {
    try {
      const accounts = await invoke<Account[]>("list_accounts");
      set({ accounts });
    } catch (e) {
      set({ error: String(e) });
    }
  },
  addAccount: async (name, gameType) => {
    try {
      const account = await invoke<Account>("add_account", { name, gameType });
      set((s) => ({ accounts: [...s.accounts, account] }));
    } catch (e) {
      set({ error: String(e) });
    }
  },
  removeAccount: async (id) => {
    try {
      await invoke("remove_account", { id });
      set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }));
    } catch (e) {
      set({ error: String(e) });
    }
  },
  focusAccount: async (id) => {
    try {
      await invoke("focus_account", { id });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  profiles: [],
  monitors: [],
  fetchProfiles: async () => {
    try {
      const profiles = await invoke<LayoutProfile[]>("list_profiles");
      set({ profiles });
    } catch (e) {
      set({ error: String(e) });
    }
  },
  fetchMonitors: async () => {
    try {
      const monitors = await invoke<MonitorInfo[]>("get_monitors");
      set({ monitors });
    } catch (e) {
      set({ error: String(e) });
    }
  },
  applyProfile: async (id) => {
    try {
      await invoke("apply_profile", { profileId: id });
    } catch (e) {
      set({ error: String(e) });
    }
  },
  scanWindows: async () => {
    try {
      await invoke("scan_windows");
      await get().fetchAccounts();
    } catch (e) {
      set({ error: String(e) });
    }
  },

  isLoading: false,
  error: null,
  clearError: () => set({ error: null }),
}));
