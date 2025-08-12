"use client";

import Link from "next/link";
import React from "react";

export default function PlayBotSetupPage() {
  const [side, setSide] = React.useState<'w' | 'b'>('w');
  const [difficulty, setDifficulty] = React.useState<'easy' | 'normal' | 'hard'>('normal');

  const href = `/play/bot/match?as=${side}&d=${difficulty}`;

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Play vs Bot — Setup</h1>
      <p className="text-sm text-muted-foreground">Choose options before starting your match.</p>

      <div className="grid gap-4 max-w-md">
        <div className="rounded border p-4 space-y-4 bg-white dark:bg-zinc-900">
          <div className="space-y-2">
            <div className="font-medium">Side</div>
            <div className="flex gap-2">
              <button onClick={() => setSide('w')} className={`px-3 py-1 rounded text-sm font-medium ${side==='w' ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Play as White</button>
              <button onClick={() => setSide('b')} className={`px-3 py-1 rounded text-sm font-medium ${side==='b' ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Play as Black</button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium">Difficulty</div>
            <div className="flex gap-2">
              {(['easy','normal','hard'] as const).map(d => (
                <button key={d} onClick={() => setDifficulty(d)} className={`px-3 py-1 rounded text-sm font-medium ${difficulty===d ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{d[0].toUpperCase()+d.slice(1)}</button>
              ))}
            </div>
          </div>
        </div>

        <Link href={href} className="inline-block px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-medium w-max">Start Match</Link>
      </div>
    </section>
  );
}

