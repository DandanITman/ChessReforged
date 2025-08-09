"use client";

import { useState } from "react";
import type { PieceSymbol } from "chess.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfileStore } from "@/lib/store/profile";

const PIECE_LABEL: Record<PieceSymbol, string> = {
  p: "Pawn",
  n: "Knight",
  b: "Bishop",
  r: "Rook",
  q: "Queen",
  k: "King",
};

export default function ShopPage() {
  const credits = useProfileStore((s) => s.credits);
  const inventory = useProfileStore((s) => s.inventory);
  const openBasicPack = useProfileStore((s) => s.openBasicPack);
  const [lastReceived, setLastReceived] = useState<{ type: PieceSymbol; count: number }[] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  function handleOpen() {
    const res = openBasicPack();
    if ("error" in res) {
      setError(res.error);
      setLastReceived(null);
    } else {
      setError(null);
      setLastReceived(res.received);
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Shop</h1>
      <p className="text-sm text-muted-foreground">
        Open packs to unlock new pieces. This is a local stub; no server calls yet.
      </p>

      <Card className="p-4 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Credits</div>
          <div className="text-2xl font-semibold">{credits}</div>
        </div>
        <Button onClick={handleOpen}>Open Basic Pack (100)</Button>
      </Card>

      {error ? (
        <div className="rounded-md border border-red-300/60 bg-red-50/50 dark:bg-red-950/20 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {lastReceived ? (
        <Card className="p-4">
          <div className="font-medium mb-2">You received</div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {lastReceived.map((g, i) => (
              <li key={i} className="flex items-center justify-between rounded-md border px-2 py-1">
                <span>{PIECE_LABEL[g.type]}</span>
                <span className="text-muted-foreground">x{g.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className="p-4">
        <div className="font-medium mb-2">Inventory</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {(Object.keys(PIECE_LABEL) as PieceSymbol[]).map((t) => (
            <div key={t} className="rounded-md border p-3 text-center">
              <div className="text-sm text-muted-foreground">{PIECE_LABEL[t]}</div>
              <div className="text-xl font-semibold">{inventory[t]}</div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}