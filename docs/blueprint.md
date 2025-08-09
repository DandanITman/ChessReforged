# ChessReforged Web Prototype Blueprint v0.1

Vision
- A modern web-based chess variant that combines classic play with deck-building style piece unlocking and point-based custom setups.
- Initial goal: deliver a slick UI prototype, core chess board interactions, and the scaffolding for future multiplayer, bot play, and economy systems.

Core game modes for v0.1 UI
- Splash and login concept (no real auth yet).
- Mode Select: Play Bot, Play Online, Editor, Shop, Achievements, Settings.
- Top bar with small profile icon, app name, and theme toggle.

Differentiators from classic chess
- Each player has a points budget to assemble a custom starting lineup.
- King must be included and placed within the first 2 ranks for that player.
- Other pieces may be placed anywhere within the first 2 ranks as long as the total point cost does not exceed the budget.

Tech stack
- Framework: Next.js 14 (App Router) with TypeScript.
- Styling: Tailwind CSS. UI components: shadcn/ui built on Radix primitives.
- Animation: Framer Motion.
- State: Zustand for lightweight global state.
- Drag and drop: dnd-kit.
- Chess rules: chess.js (adapter layer for future custom rules).
- Bot (planned M2): stockfish.wasm via Web Worker.
- Lint/format: ESLint, Prettier.
- Tests: Vitest (unit), Playwright later (E2E).
- CI: GitHub Actions for type-check and lint on PRs.
- Hosting: Vercel for the web app.

Architecture overview
flowchart TD
User --> UI
UI --> Screens
UI --> Components
UI --> State
UI --> Rules
UI --> Bot
Screens --> Navigation
Components --> DesignSystem
State --> LocalStore
Rules --> ChessLib
Rules --> CustomPlacement
Bot --> Worker
Worker --> StockfishWasm
UI --> MockServices

Repository layout
- [package.json](package.json)
- [next.config.mjs](next.config.mjs)
- [tsconfig.json](tsconfig.json)
- [tailwind.config.ts](tailwind.config.ts)
- [postcss.config.mjs](postcss.config.mjs)
- [src/app/layout.tsx](src/app/layout.tsx)
- [src/app/page.tsx](src/app/page.tsx)
- [src/app/play/bot/page.tsx](src/app/play/bot/page.tsx)
- [src/app/play/online/page.tsx](src/app/play/online/page.tsx)
- [src/app/editor/page.tsx](src/app/editor/page.tsx)
- [src/app/shop/page.tsx](src/app/shop/page.tsx)
- [src/app/achievements/page.tsx](src/app/achievements/page.tsx)
- [src/app/settings/page.tsx](src/app/settings/page.tsx)
- [src/components/TopBar.tsx](src/components/TopBar.tsx)
- [src/components/NavTile.tsx](src/components/NavTile.tsx)
- [src/components/ChessBoard.tsx](src/components/ChessBoard.tsx)
- [src/lib/chess/placement.ts](src/lib/chess/placement.ts)
- [src/lib/store/ui.ts](src/lib/store/ui.ts)
- [public/](public)
- [README.md](README.md)
- [docs/blueprint.md](docs/blueprint.md)

UI flows and screens
- Splash/Login concept: brand, primary CTA, continue as guest.
- Mode Select: large tiles leading to each section. Use [src/components/NavTile.tsx](src/components/NavTile.tsx).
- Global layout: [src/app/layout.tsx](src/app/layout.tsx) wraps pages with [src/components/TopBar.tsx](src/components/TopBar.tsx).
- Play Bot: loads [src/components/ChessBoard.tsx](src/components/ChessBoard.tsx). Initially human vs human on one device; M2 adds bot moves.
- Editor: drag pieces onto first two ranks within budget; uses [src/lib/chess/placement.ts](src/lib/chess/placement.ts).
- Shop: stub list of packs and an open animation placeholder.
- Achievements: static grid with sample achievements.
- Settings: theme toggle, sound toggles.

Data and rules
- Points budget: define costs per piece type in a config map inside [src/lib/chess/placement.ts](src/lib/chess/placement.ts).
- Inventory: client-side mock store in [src/lib/store/ui.ts](src/lib/store/ui.ts) for v0.1, server later.
- Placement validator: ensure exactly one king and enforce first-two-ranks constraint and budget.
- Match rules post-start: standard chess.js legality for moves and check/checkmate.

Milestones
- M0: Initial scaffold, screens, placeholder chessboard, first commit to main.
- M1: Core chess with legal moves and Editor constraints.
- M2: Bot response using stockfish.wasm worker.
- M3: Visual polish and micro-interactions.
- M4: Backend scaffolding, auth, user profiles.
- M5: Multiplayer lobby and matchmaking.

CI and quality
- Add GitHub Actions workflow to run type-check, lint on pushes and PRs.
- Pre-commit scripts: format and lint staged files.

First commit scope
- Scaffold Next.js TypeScript app with Tailwind.
- Install and configure shadcn/ui base components (Button, Card) for consistent visuals.
- Implement Splash, Mode Select, placeholders for key pages.
- Add TopBar with profile icon placeholder and theme toggle.
- Add ChessBoard placeholder with grid and initial classic setup option.
- Include README with quick start and roadmap.

Push instructions
- If not done automatically, run these commands locally to push the first commit to the repo:
- git init
- git add .
- git commit -m "chore: initial scaffold v0.1"
- git branch -M main
- git remote add origin https://github.com/DandanITman/ChessReforged.git
- git push -u origin main

Notes
- We will prefer pnpm for speed; if your environment does not have pnpm, install with: corepack enable && corepack prepare pnpm@latest --activate.
- After dependencies install, run dev server with: pnpm dev.