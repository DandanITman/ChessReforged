# Bot Integration Plan (stockfish.wasm)

Objective
- Integrate a chess engine for Play vs Bot using a Web Worker to avoid blocking the UI. Start with a simple “engine makes a reply” after the player moves.

Approach
- Engine: Stockfish WASM build (e.g., npm stockfish or a pinned CDN wasm + worker).
- Worker: Dedicated worker that receives FEN + search params, returns bestmove.
- UI: When user moves in Play vs Bot, send current FEN to worker, apply engine best move when received.

Message protocol
- Worker in:
  - { type: "init" }
  - { type: "position", fen: string }
  - { type: "go", movetime?: number, depth?: number }
- Worker out:
  - { type: "ready" }
  - { type: "info", payload: any } // optional passthrough from engine
  - { type: "bestmove", move: string } // UCI move like "e2e4"

Store and UI integration
- Game state remains in client store (Zustand) via src/lib/store/game.ts for legal user moves.
- After user move:
  1) Update store
  2) Post { position: fen } to worker
  3) Post { go, movetime: 200 } to worker (very fast for responsiveness)
  4) On bestmove, validate and apply in store.

Quality of life
- Debounce or “engine thinking” indicator while waiting.
- Configurable difficulty via movetime or depth in Settings.
- Optionally support “engine plays white/black” toggle.

Anti-stall
- If engine returns an illegal move (rare), fallback with another go cycle once; else resign/error.

File scaffold to add next
- src/lib/bot/stockfish.worker.ts — spawns stockfish, maps messages, posts bestmove.
- src/lib/bot/client.ts — thin wrapper with start/stop/post helpers for React components.

Future multiplayer compatibility
- When multiplayer arrives, Play vs Bot remains client-only, but a future server-authoritative option can proxy to a server engine for fairness on rated modes.

Testing strategy
- Unit-test the worker message protocol with mocked stockfish.
- E2E: ensure a user move triggers a single engine reply and UI remains responsive.

Performance notes
- Keep movetime small (~100–300ms) for prototype; later allow depth/time configuration.
- Avoid reevaluating before applying bestmove (guard re-entrancy with an “engineBusy” flag).

Security notes
- Engine runs locally in the browser; acceptable for casual play. Rated multiplayer will validate moves server-side later.

Deployment
- Ensure assets (wasm/worker) are served and cross-origin isolated if needed by chosen stockfish build; prefer npm package that hides details.