"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import BotChessBoard from "@/components/BotChessBoard";
import MoveHistoryPanel from "@/components/MoveHistoryPanel";
import ReadOnlyBoard from "@/components/ReadOnlyBoard";
import { useBotGameStore } from "@/lib/store/botGame";
import { SFX } from "@/lib/sound/sfx";
import { useSettingsStore } from "@/lib/store/settings";

export default function PlayBotMatchPage() {
  const params = useSearchParams();
  const as = params.get("as");
  const d = params.get("d");
  const reset = useBotGameStore((s) => s.reset);
  const setDifficulty = useBotGameStore((s) => s.setDifficulty);
  const fen = useBotGameStore((s) => s.fen);
  const status = useBotGameStore((s) => s.getGameStatus());
  const resign = useBotGameStore((s) => s.resign);

  const [previewFen, setPreviewFen] = useState<string | null>(null);

  useEffect(() => {
    if (as === "w" || as === "b") {
      reset(as as any);
    }
    if (d === 'easy' || d === 'normal' || d === 'hard') {
      setDifficulty(d);
    }
  }, [as, d, reset, setDifficulty]);

  const boardArea = useMemo(() => {
    if (previewFen) {
      return (
        <div className="space-y-2">
          <ReadOnlyBoard fen={previewFen} />
          <div>
            <button className="px-3 py-1 rounded text-sm font-medium bg-blue-600 text-white" onClick={() => setPreviewFen(null)}>Return to live</button>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <BotChessBoard showControls={false} />
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded text-sm font-medium bg-green-600 text-white" onClick={() => reset(as === 'w' || as === 'b' ? (as as any) : undefined)}>New Game</button>
          <button className="px-3 py-1 rounded text-sm font-medium bg-red-600 text-white" onClick={() => resign('w')}>Resign (White)</button>
          <button className="px-3 py-1 rounded text-sm font-medium bg-red-600 text-white" onClick={() => resign('b')}>Resign (Black)</button>
        </div>
        <div className="text-sm text-zinc-600 dark:text-zinc-300">{status}</div>
      </div>
    );
  }, [previewFen, reset, resign, status, as]);

  const sfxEnabled = useSettingsStore((s) => s.sfxEnabled);
  const setSfxEnabled = useSettingsStore((s) => s.setSfxEnabled);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
      <div>
        {boardArea}
        <div className="mt-2 flex items-center gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sfxEnabled} onChange={(e) => setSfxEnabled(e.target.checked)} />
            Enable sound effects
          </label>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Move history</h2>
        <MoveHistoryPanel onSelect={(entry) => { if (entry) SFX.preview(); setPreviewFen(entry?.fenAfter ?? null); }} />
      </div>
    </section>
  );
}

