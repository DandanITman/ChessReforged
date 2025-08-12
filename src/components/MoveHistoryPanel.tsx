"use client";

import React from "react";
import { useBotGameStore, type HistoryEntry } from "@/lib/store/botGame";
import { pieceSprite } from "@/lib/chess/pieceSprites";
import type { PieceSymbol } from "chess.js";

function CapturesRow({ title, color, pieces }: { title: string; color: "w" | "b"; pieces: PieceSymbol[] }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{title}</span>
      <div className="flex flex-wrap gap-1">
        {pieces.length === 0 ? (
          <span className="text-xs text-zinc-500">—</span>
        ) : (
          pieces.map((p, i) => (
            <img key={i} src={pieceSprite(color, p)} alt={`${color}-${p}`} className="h-5 w-5" />
          ))
        )}
      </div>
    </div>
  );
}

function MovesList({ history, onSelect }: { history: HistoryEntry[]; onSelect?: (entry: HistoryEntry | null) => void }) {
  // group into rows of [moveNumber, whiteSan, blackSan]
  const rows: { num: number; w?: string; b?: string }[] = [];
  for (const h of history) {
    const idx = h.moveNumber - 1;
    if (!rows[idx]) rows[idx] = { num: h.moveNumber };
    if (h.color === "w") rows[idx].w = h.san;
    else rows[idx].b = h.san;
  }
  return (
    <div className="max-h-64 overflow-auto rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-100 dark:bg-zinc-800">
            <th className="px-2 py-1 text-left w-10 text-zinc-700 dark:text-zinc-200">#</th>
            <th className="px-2 py-1 text-left text-zinc-700 dark:text-zinc-200">White</th>
            <th className="px-2 py-1 text-left text-zinc-700 dark:text-zinc-200">Black</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.num} className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-800">
              <td className="px-2 py-1 text-zinc-600 dark:text-zinc-300">{r.num}</td>
              <td className="px-2 py-1">
                {r.w ? (
                  <button className="underline-offset-2 hover:underline" onClick={() => onSelect?.(history[i * 2])}>{r.w}</button>
                ) : null}
              </td>
              <td className="px-2 py-1">
                {r.b ? (
                  <button className="underline-offset-2 hover:underline" onClick={() => onSelect?.(history[i * 2 + 1])}>{r.b}</button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MoveHistoryPanel({ onSelect }: { onSelect?: (entry: HistoryEntry | null) => void }) {
  const history = useBotGameStore((s) => s.history);
  const capturedByWhite = useBotGameStore((s) => s.capturedByWhite);
  const capturedByBlack = useBotGameStore((s) => s.capturedByBlack);

  return (
    <div className="space-y-3">
      <MovesList history={history} onSelect={onSelect} />
      <div className="flex items-center justify-between gap-4">
        <CapturesRow title="White captured" color="w" pieces={capturedByWhite} />
        <CapturesRow title="Black captured" color="b" pieces={capturedByBlack} />
      </div>
    </div>
  );
}

