"use client";

// Simple sound effects manager with small pitch variation and pooling
// Expected files (place them under public/sounds/):
// - drag.mp3
// - drop.mp3
// - capture.mp3
// - win.mp3
// - select.mp3
// - illegal.mp3
// - check.mp3
// - preview.mp3

const basePath = "/sounds"; // default directory for Freesound placeholders

function makeAudio(srcBase: string) {
  // Use MP3 only
  const audio = new Audio();
  audio.src = `${srcBase}.mp3`;
  return audio;
}

function makePool(srcBase: string, size = 4) {
  if (typeof window === "undefined") return { play: () => {} } as const;
  const pool: HTMLAudioElement[] = Array.from({ length: size }, () => makeAudio(srcBase));
  let idx = 0;
  let lastPlay = 0;
  const play = (volume = 0.7, detune = 0, cooldownMs = 60) => {
    try {
      const now = Date.now();
      if (now - lastPlay < cooldownMs) return;
      lastPlay = now;
      const a = pool[idx];
      idx = (idx + 1) % pool.length;
      a.pause();
      a.currentTime = 0;
      a.volume = volume;
      // Simulate detune by using playbackRate (~ +/- 3%)
      const delta = detune || (1 + (Math.random() * 0.06 - 0.03));
      a.playbackRate = Math.max(0.8, Math.min(1.2, delta));
      void a.play();
    } catch {
      // no-op
    }
  };
  return { play } as const;
}

const pools = {
  drag: makePool(`${basePath}/drag`, 3),
  drop: makePool(`${basePath}/drop`, 4),
  capture: makePool(`${basePath}/capture`, 4),
  win: makePool(`${basePath}/win`, 2),
  select: makePool(`${basePath}/select`, 3),
  illegal: makePool(`${basePath}/illegal`, 2),
  check: makePool(`${basePath}/check`, 2),
  preview: makePool(`${basePath}/preview`, 2),
};

import { useSettingsStore } from "@/lib/store/settings";

export const SFX = {
  enabled(): boolean {
    try { return useSettingsStore.getState().sfxEnabled; } catch { return true; }
  },
  drag(volume = 0.5) {
    if (!this.enabled()) return; pools.drag.play(volume);
  },
  drop(volume = 0.65) {
    if (!this.enabled()) return; pools.drop.play(volume);
  },
  capture(volume = 0.8) {
    if (!this.enabled()) return; pools.capture.play(volume);
  },
  win(volume = 0.9) {
    if (!this.enabled()) return; pools.win.play(volume);
  },
  select(volume = 0.5) {
    if (!this.enabled()) return; pools.select.play(volume);
  },
  illegal(volume = 0.6) {
    if (!this.enabled()) return; pools.illegal.play(volume);
  },
  check(volume = 0.7) {
    if (!this.enabled()) return; pools.check.play(volume, 0, 200);
  },
  preview(volume = 0.5) {
    if (!this.enabled()) return; pools.preview.play(volume, 0, 100);
  },
};

