"use client";

import EditorBoard from "@/components/EditorBoard";
import { useEditorStore } from "@/lib/store/editor";
import { Button } from "@/components/ui/button";

const PIECES: { key: string; type: "p" | "n" | "b" | "r" | "q" | "k"; label: string }[] = [
  { key: "p", type: "p", label: "Pawn" },
  { key: "n", type: "n", label: "Knight" },
  { key: "b", type: "b", label: "Bishop" },
  { key: "r", type: "r", label: "Rook" },
  { key: "q", type: "q", label: "Queen" },
  { key: "k", type: "k", label: "King" },
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

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Board Editor</h1>
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
        Click a square in your first two ranks to place the selected piece. Shift/Ctrl/Meta click or right-click to remove a piece.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {PIECES.map((p) => (
          <Button
            key={p.key}
            variant={selectedType === p.type ? "default" : "outline"}
            onClick={() => setSelectedType(p.type)}
          >
            {p.label}
          </Button>
        ))}
        <div className="ml-4 flex items-center gap-2 text-sm">
          <label htmlFor="budget" className="text-muted-foreground">
            Budget
          </label>
          <input
            id="budget"
            type="number"
            className="h-9 w-20 rounded-md border bg-background px-2 text-sm"
            value={budget}
            onChange={(e) => {
              const v = Number(e.target.value || 0);
              setBudget(Number.isFinite(v) ? Math.max(0, v) : budget);
            }}
          />
          <span className="text-muted-foreground">Remaining:</span>
          <span className={validation.remaining >= 0 ? "text-emerald-600" : "text-red-600"}>
            {validation.remaining}
          </span>
        </div>
        <div className="ml-auto">
          <Button variant="outline" onClick={() => clear()}>Clear</Button>
        </div>
      </div>

      <EditorBoard />

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
          Placement is valid.
        </div>
      )}
    </section>
  );
}