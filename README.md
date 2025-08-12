# Chess Reforged (Web Prototype v0.1)

A modern web-based chess variant with point-based custom setups, unlockable pieces, and classic play modes.

Blueprint and plan
- See docs/blueprint.md for the technical blueprint, architecture, and milestones.

Features in this prototype
- Splash replacement: Mode Select on home with tiles
- Global TopBar with profile icon placeholder and theme toggle
- Pages scaffolded: Play vs Bot, Play Online (stub), Editor, Shop, Achievements, Settings
- **ChessBoard component with high-quality chess piece PNG icons (256x256) and full functionality**
- **AI Bot opponent with strategic move evaluation**
- **Human vs Human and Human vs Bot game modes**
- **Drag-and-drop piece movement with legal move validation**

Stack
- Next.js 15 (App Router), TypeScript
- Tailwind CSS v4
- shadcn/ui (Radix primitives)
- Icons: lucide-react

Scripts
- npm run dev  Start dev server
- npm run build  Build production bundle
- npm run start  Start production server
- npm run lint  Lint with ESLint

Quick start
1. Install dependencies
   npm install
2. Start development server
   npm run dev
3. Open http://localhost:3000

Project structure
- src/app: routes (play/bot, play/online, editor, shop, achievements, settings)
- src/components: TopBar, NavTile, ChessBoard, shadcn/ui components in src/components/ui
- src/lib: utils (cn)
- public: static assets
- docs: blueprint

Roadmap (high-level)
- M1: Core chess (chess.js) and Editor placement validation (points and first two ranks)
- M2: Bot using stockfish.wasm in a Web Worker
- M3: Visual polish (animations, transitions)
- M4: Backend scaffolding, auth, profiles
- M5: Multiplayer lobby and matchmaking

Notes
- Theme: Light/dark toggle sets data-theme on html root; Tailwind v4 CSS variables map the theme colors.
- Component kit: Added Button, Card, Navigation Menu, Avatar, Dropdown Menu via shadcn CLI.
