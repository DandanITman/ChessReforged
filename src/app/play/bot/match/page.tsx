"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import BotChessBoard from "@/components/BotChessBoard";
import MoveHistoryPanel from "@/components/MoveHistoryPanel";
import ReadOnlyBoard from "@/components/ReadOnlyBoard";
import { useBotGameStore } from "@/lib/store/botGame";
import { useEditorStore } from "@/lib/store/editor";
import { decksToFen, generateCustomPieceMapping } from "@/lib/chess/deckSystem";
import { SFX } from "@/lib/sound/sfx";
import { useSettingsStore } from "@/lib/store/settings";
import type { Color } from "chess.js";

export default function PlayBotMatchPage() {
  const params = useSearchParams();
  const as = params.get("as");
  const d = params.get("d");
  const deckParam = params.get("deck");
  const opponentDeckParam = params.get("opponentDeck");

  const reset = useBotGameStore((s) => s.reset);
  const setDifficulty = useBotGameStore((s) => s.setDifficulty);
  const fen = useBotGameStore((s) => s.fen);
  const status = useBotGameStore((s) => s.getGameStatus());
  const resign = useBotGameStore((s) => s.resign);

  // Get decks from editor store
  const decks = useEditorStore((s) => s.decks);

  const [previewFen, setPreviewFen] = useState<string | null>(null);

  useEffect(() => {
    if (as === "w" || as === "b") {
      const playerColor = as as Color;

      // Find the selected deck and opponent's main deck
      let playerDeck = null;
      let opponentDeck = null;

      if (deckParam) {
        playerDeck = decks.find(d => d.id === deckParam && d.color === playerColor);
      }

      // If no specific deck found, use main deck for player color
      if (!playerDeck) {
        playerDeck = decks.find(d => d.color === playerColor && d.isMain);
      }

      // Get opponent deck (either specified or main deck)
      const opponentColor = playerColor === 'w' ? 'b' : 'w';
      
      if (opponentDeckParam) {
        opponentDeck = decks.find(d => d.id === opponentDeckParam && d.color === opponentColor);
      }
      
      // If no specific opponent deck found, use main deck for opponent color
      if (!opponentDeck) {
        opponentDeck = decks.find(d => d.color === opponentColor && d.isMain);
      }

      // If no main deck found for opponent, use the first available deck of that color
      if (!opponentDeck) {
        opponentDeck = decks.find(d => d.color === opponentColor);
      }

      // Generate FEN from decks
      let customFen: string | undefined;
      let customMapping;
      if (playerDeck || opponentDeck) {
        const whiteDeck = playerColor === 'w' ? playerDeck : opponentDeck;
        const blackDeck = playerColor === 'w' ? opponentDeck : playerDeck;
        customFen = decksToFen(whiteDeck || null, blackDeck || null);
        customMapping = generateCustomPieceMapping(whiteDeck || null, blackDeck || null);
      }

      reset(playerColor, customFen, customMapping);
    }
    if (d === 'easy' || d === 'normal' || d === 'hard') {
      setDifficulty(d);
    }
  }, [as, d, deckParam, decks, reset, setDifficulty]);

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
          <button className="px-3 py-1 rounded text-sm font-medium bg-green-600 text-white" onClick={() => {
            if (as === 'w' || as === 'b') {
              const playerColor = as as Color;
              let playerDeck = null;
              let opponentDeck = null;

              // Find player deck
              if (deckParam) {
                playerDeck = decks.find(d => d.id === deckParam && d.color === playerColor);
              }

              if (!playerDeck) {
                playerDeck = decks.find(d => d.color === playerColor && d.isMain);
              }

              // Find opponent deck
              const opponentColor = playerColor === 'w' ? 'b' : 'w';
              
              if (opponentDeckParam) {
                opponentDeck = decks.find(d => d.id === opponentDeckParam && d.color === opponentColor);
              }
              
              if (!opponentDeck) {
                opponentDeck = decks.find(d => d.color === opponentColor && d.isMain);
              }

              // If no main deck found for opponent, use the first available deck of that color
              if (!opponentDeck) {
                opponentDeck = decks.find(d => d.color === opponentColor);
              }

              let customFen: string | undefined;
              let customMapping;
              if (playerDeck || opponentDeck) {
                const whiteDeck = playerColor === 'w' ? playerDeck : opponentDeck;
                const blackDeck = playerColor === 'w' ? opponentDeck : playerDeck;
                customFen = decksToFen(whiteDeck || null, blackDeck || null);
                customMapping = generateCustomPieceMapping(whiteDeck || null, blackDeck || null);
              }

              reset(playerColor, customFen, customMapping);
            }
          }}>New Game</button>
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

