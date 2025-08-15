"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
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

function BotMatchContent() {
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
      return <ReadOnlyBoard fen={previewFen} />;
    }
    return <BotChessBoard showControls={false} />;
  }, [previewFen]);

  const handleNewGame = () => {
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
  };

  const sfxEnabled = useSettingsStore((s) => s.sfxEnabled);
  const setSfxEnabled = useSettingsStore((s) => s.setSfxEnabled);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
      <div>
        {boardArea}
      </div>
      <div className="space-y-4">
        {/* Game Status */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-sm font-medium text-muted-foreground mb-1">Game Status</div>
          <div className="text-sm">{status}</div>
        </div>

        {/* Game Controls */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Game Controls</div>
          
          {previewFen ? (
            <button
              className="w-full px-3 py-2 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              onClick={() => setPreviewFen(null)}
            >
              Return to Live Game
            </button>
          ) : (
            <div className="space-y-2">
              <button
                className="w-full px-3 py-2 rounded text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                onClick={handleNewGame}
              >
                New Game
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="px-3 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                  onClick={() => resign('w')}
                >
                  Resign (White)
                </button>
                <button
                  className="px-3 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                  onClick={() => resign('b')}
                >
                  Resign (Black)
                </button>
              </div>
            </div>
          )}

          {/* Sound Effects Toggle */}
          <div className="pt-2 border-t">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sfxEnabled}
                onChange={(e) => setSfxEnabled(e.target.checked)}
                className="rounded"
              />
              Enable sound effects
            </label>
          </div>
        </div>

        {/* Move History */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Move History</div>
          <MoveHistoryPanel onSelect={(entry) => { if (entry) SFX.preview(); setPreviewFen(entry?.fenAfter ?? null); }} />
        </div>
      </div>
    </section>
  );
}

export default function PlayBotMatchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <BotMatchContent />
    </Suspense>
  );
}

