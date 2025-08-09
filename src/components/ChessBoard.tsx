import React from "react";
import { cn } from "@/lib/utils";

const files = ["a","b","c","d","e","f","g","h"];

export default function ChessBoard() {
  return (
    <div className="inline-block">
      <div className="grid grid-cols-[20px_repeat(8,48px)] grid-rows-[repeat(8,48px)_20px] border rounded-md overflow-hidden">
        {Array.from({ length: 8 }).map((_, rankIndex) => {
          const rank = 8 - rankIndex;
          return (
            <React.Fragment key={rank}>
              <div className="flex items-center justify-center text-xs text-muted-foreground select-none">
                {rank}
              </div>
              {files.map((f, fileIndex) => {
                const isDark = (rankIndex + fileIndex) % 2 === 1;
                return (
                  <div
                    key={`${f}${rank}`}
                    className={cn(
                      "size-12",
                      isDark ? "bg-zinc-700/40" : "bg-zinc-200/60",
                      "relative"
                    )}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
        <div />
        {files.map((f) => (
          <div key={f} className="flex items-center justify-center text-xs text-muted-foreground select-none">
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}