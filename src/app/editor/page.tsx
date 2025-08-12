"use client";

import EditorBoard from "@/components/EditorBoard";
import { useEditorStore } from "@/lib/store/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pieceSprite } from "@/lib/chess/pieceSprites";
import { PIECE_COSTS } from "@/lib/chess/placement";
import { useState } from "react";

const PIECES: { key: string; type: "p" | "n" | "b" | "r" | "q" | "k"; label: string; category: string }[] = [
  { key: "p", type: "p", label: "Pawn", category: "Basic" },
  { key: "n", type: "n", label: "Knight", category: "Basic" },
  { key: "b", type: "b", label: "Bishop", category: "Basic" },
  { key: "r", type: "r", label: "Rook", category: "Basic" },
  { key: "q", type: "q", label: "Queen", category: "Basic" },
  { key: "k", type: "k", label: "King", category: "Basic" },
];

export default function EditorPage() {
  const color = useEditorStore((s) => s.color);
  const budget = useEditorStore((s) => s.budget);
  const selectedType = useEditorStore((s) => s.selectedType);
  const validation = useEditorStore((s) => s.validation);
  const setColor = useEditorStore((s) => s.setColor);
  const setBudget = useEditorStore((s) => s.setBudget);
  const setSelectedType = useEditorStore((s) => s.setSelectedType);
  const clear = useEditorStore((s) => s.clear);

  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  const filteredPieces = PIECES.filter(piece =>
    filterType === "all" || piece.category.toLowerCase() === filterType
  ).sort((a, b) => {
    if (sortBy === "cost") {
      return PIECE_COSTS[a.type] - PIECE_COSTS[b.type];
    }
    return a.label.localeCompare(b.label);
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Army Builder</h1>
        <div className="flex items-center gap-2">
          <Button variant={color === "w" ? "default" : "outline"} onClick={() => setColor("w")}>
            White
          </Button>
          <Button variant={color === "b" ? "default" : "outline"} onClick={() => setColor("b")}>
            Black
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Click a square in your first three ranks to place the selected piece. Shift/Ctrl/Meta click or right-click to remove a piece.
      </p>

      <div className="flex gap-6">
        {/* Board Section */}
        <div className="flex-shrink-0">
          <EditorBoard />

          {/* Validation below board */}
          <div className="mt-4">
            {validation.errors.length > 0 ? (
              <div className="rounded-md border border-red-300/60 bg-red-50/50 dark:bg-red-950/20 p-3">
                <p className="font-medium text-red-700 dark:text-red-300 mb-1">Validation</p>
                <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-300">
                  {validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-md border border-emerald-300/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                Army is valid and ready for battle!
              </div>
            )}
          </div>
        </div>

        {/* Piece Drawer Section */}
        <div className="flex-1 min-w-0">
          <div className="space-y-4">
            {/* Budget and Controls */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <label htmlFor="budget" className="text-muted-foreground font-medium">
                    Budget:
                  </label>
                  <Input
                    id="budget"
                    type="number"
                    className="h-8 w-16 text-center"
                    value={budget}
                    onChange={(e) => {
                      const v = Number(e.target.value || 0);
                      setBudget(Number.isFinite(v) ? Math.max(0, v) : budget);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className={`font-semibold ${validation.remaining >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {validation.remaining}
                  </span>
                </div>
              </div>
              <Button variant="outline" onClick={() => clear()}>
                Clear Army
              </Button>
            </div>

            {/* Filters and Sorting */}
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">Filter:</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">Sort by:</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="cost">Point Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Piece Grid */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Piece Arsenal</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredPieces.map((piece) => (
                  <button
                    key={piece.key}
                    onClick={() => setSelectedType(piece.type)}
                    className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                      selectedType === piece.type
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={pieceSprite(color, piece.type)}
                        alt={piece.label}
                        className="w-12 h-12 drop-shadow-sm"
                      />
                      <div className="text-center">
                        <div className="font-medium text-sm">{piece.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {PIECE_COSTS[piece.type]} {PIECE_COSTS[piece.type] === 1 ? 'point' : 'points'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}