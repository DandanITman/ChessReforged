"use client";

import { create } from "zustand";

export type SettingsState = {
  sfxEnabled: boolean;
  setSfxEnabled(v: boolean): void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  sfxEnabled: true,
  setSfxEnabled(v) { set({ sfxEnabled: v }); },
}));

