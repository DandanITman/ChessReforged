# ChessReforged Web Prototype Blueprint v0.1

Vision
- A modern web-based chess variant that combines classic play with deck-building style piece unlocking and point-based custom setups.
- Initial goal: deliver a slick UI prototype, core chess board interactions, and the scaffolding for future multiplayer, bot play, and economy systems.

Progress checklist
- [x] Scaffold Next.js TypeScript app with Tailwind
- [x] Install and configure shadcn/ui base components (Button, Card, Nav Menu, Avatar, Dropdown)
- [x] Global layout with TopBar, profile icon, and theme toggle
- [x] Mode Select on home (tiles to Bot, Online, Editor, Shop, Achievements, Settings)
- [x] Play Bot: interactive chessboard with legal move generation and drag-and-drop
- [x] Editor: piece placement within the first two ranks, budget validation, king constraint
- [x] Shop: local stub with credits, pack opening, and inventory
- [x] Achievements: local stub with progress bars
- [x] CI with GitHub Actions; Prettier config
- [x] README and docs added
- [x] Navigation updated to non-legacy Next.js Link usage
- [x] Improved board visuals (larger squares, modern colors, piece size and shadow)

Core game modes for v0.1 UI
- [x] Splash/Mode Select (home)
- [x] Play Bot
- [x] Play Online (placeholder)
- [x] Editor
- [x] Shop
- [x] Achievements
- [x] Settings (placeholder via TopBar menu)

Differentiators from classic chess
- Each player has a points budget to assemble a custom starting lineup (client-side for now).
- King must be included and placed within the first 2 ranks for that player.
- Other pieces may be placed anywhere within the first 2 ranks as long as the total point cost does not exceed the budget.
- Current costs (prototype rules):
  - Pawn=1, Knight=3, Bishop=3, Rook=5, Queen=8, King=0 (mandatory, max 1).

Tech stack
- Framework: Next.js 15 (App Router) with TypeScript.
- Styling: Tailwind CSS v4. UI components: shadcn/ui built on Radix primitives.
- Animation: Framer Motion (planned).
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
- [next.config.ts](next.config.ts)
- [tsconfig.json](tsconfig.json)
- [postcss.config.mjs](postcss.config.mjs)
- [src/app/layout.tsx](src/app/layout.tsx)
- [src/app/page.tsx](src/app/page.tsx)
- [src/app/play/bot/page.tsx](src/app/play/bot/page.tsx)
- [src/app/play/online/page.tsx](src/app/play/online/page.tsx)
- [src/app/editor/page.tsx](src/app/editor/page.tsx)
- [src/app/shop/page.tsx](src/app/shop/page.tsx)
- [src/app/achievements/page.tsx](src/app/achievements/page.tsx)
- [src/components/TopBar.tsx](src/components/TopBar.tsx)
- [src/components/NavTile.tsx](src/components/NavTile.tsx)
- [src/components/ChessBoard.tsx](src/components/ChessBoard.tsx)
- [src/components/EditorBoard.tsx](src/components/EditorBoard.tsx)
- [src/lib/chess/placement.ts](src/lib/chess/placement.ts)
- [src/lib/store/game.ts](src/lib/store/game.ts)
- [src/lib/store/editor.ts](src/lib/store/editor.ts)
- [src/lib/store/profile.ts](src/lib/store/profile.ts)
- [docs/blueprint.md](docs/blueprint.md)
- [docs/bot-plan.md](docs/bot-plan.md)

UI flows and screens
- Mode Select: large tiles leading to each section. Uses [src/components/NavTile.tsx](src/components/NavTile.tsx).
- Global layout: [src/app/layout.tsx](src/app/layout.tsx) wraps pages with [src/components/TopBar.tsx](src/components/TopBar.tsx).
- Play Bot: loads [src/components/ChessBoard.tsx](src/components/ChessBoard.tsx). Human moves and DnD working; bot reply planned next.
- Editor: drag pieces onto first two ranks within budget; uses [src/lib/chess/placement.ts](src/lib/chess/placement.ts) and [src/components/EditorBoard.tsx](src/components/EditorBoard.tsx).
- Shop: stub list of packs and open animation placeholder in [src/app/shop/page.tsx](src/app/shop/page.tsx).
- Achievements: local state grid with progress bars in [src/app/achievements/page.tsx](src/app/achievements/page.tsx).
- Settings: theme toggle via TopBar, future settings page.

Data and rules
- Points budget: configurable in [src/lib/chess/placement.ts](src/lib/chess/placement.ts).
- Current piece costs: Pawn=1, Knight=3, Bishop=3, Rook=5, Queen=8, King=0 (mandatory, max 1).
- Inventory: client-side mock store in [src/lib/store/profile.ts](src/lib/store/profile.ts).
- Placement validator: ensures exactly one king, first-two-ranks constraint, and budget.
- Match rules post-start: standard chess.js legality for moves and check/checkmate.

Milestones
- [x] M0: Initial scaffold, screens, placeholder chessboard, first commit to main.
- [x] M1: Core chess with legal moves and Editor constraints; Shop and Achievements stubs.
- [ ] M2: Bot response using stockfish.wasm worker.
- [ ] M3: Visual polish and micro-interactions (animations, transitions); sounds.
- [ ] M4: Backend scaffolding, auth, user profiles.
- [ ] M5: Multiplayer lobby and matchmaking.

CI and quality
- [x] GitHub Actions workflow for lint, type-check, and build.
- [x] Prettier config and scripts.

Next actions
- Implement stockfish.wasm worker and connect to Play vs Bot.
- Add settings for bot difficulty (movetime/depth).
- Enhance Editor UX: inventory gating and quick placement shortcuts.
- Add piece themes/assets (sprite or SVG set) to improve readability and style on the board.