# ♟️ Chess Reforged

> **A modern, feature-rich chess experience built for the web**

Welcome to Chess Reforged - where classic chess meets modern web technology! This isn't just another chess app; it's a complete chess platform with AI opponents, move history, sound effects, and an intuitive interface that rivals chess.com.

## ✨ Features

### 🎮 **Multiple Game Modes**
- **Human vs Human** - Challenge friends locally
- **Human vs Bot** - Face off against our AI with 3 difficulty levels
- **Setup Screen** - Choose your side and difficulty before battle

### 🎯 **Chess.com-Style Gameplay**
- **Click-to-Move** - Click a piece to see legal moves, click destination to move
- **Drag & Drop** - Traditional drag-and-drop movement
- **Move Validation** - Only legal moves allowed, with visual feedback
- **Move History** - Complete game notation with captured pieces display
- **Position Preview** - Click any move in history to preview that position

### 🤖 **Smart AI Opponent**
- **Easy Mode** - Random moves for beginners
- **Normal Mode** - Strategic evaluation with piece values and positioning
- **Hard Mode** - Multi-ply lookahead with minimax search

### 🔊 **Immersive Sound Effects**
- Piece selection, movement, and capture sounds
- Special effects for check, checkmate, and illegal moves
- Move preview and drag sounds
- Toggle on/off with in-game settings

### 🎨 **Beautiful Interface**
- High-quality 256x256 chess piece sprites
- Smooth animations and visual feedback
- Dark/light theme support
- Responsive design for all devices

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd chess-reforged

# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser
open http://localhost:3000
```

## 🎵 Sound Setup (Optional)

For the full experience, add sound effects to `public/sounds/`:
- `drag.mp3/wav` - Piece selection sound
- `drop.mp3/wav` - Piece placement sound
- `capture.mp3/wav` - Piece capture sound
- `select.mp3/wav` - Piece selection sound
- `illegal.mp3/wav` - Invalid move sound
- `check.mp3/wav` - Check notification sound
- `win.mp3/wav` - Game victory sound
- `preview.mp3/wav` - Move preview sound

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix primitives)
- **Chess Logic**: chess.js
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit/core
- **Icons**: Lucide React

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run pieces:black:replace  # Process black piece sprites
npm run pieces:white:resize   # Process white piece sprites
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── play/bot/          # Bot game modes
│   ├── editor/            # Board editor (coming soon)
│   └── ...                # Other game modes
├── components/            # React components
│   ├── BotChessBoard.tsx  # Main chess board with AI
│   ├── MoveHistoryPanel.tsx # Move history & captures
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── bot/               # AI chess bot logic
│   ├── chess/             # Chess utilities & sprites
│   ├── sound/             # Sound effects manager
│   └── store/             # Zustand state management
public/
├── pieces/                # Chess piece PNG sprites
└── sounds/                # Sound effects (optional)
```

## 🎯 How to Play

1. **Start a Game**: Navigate to "Play Bot" from the home screen
2. **Setup**: Choose your side (White/Black) and difficulty level
3. **Make Moves**:
   - Click a piece to see legal moves (highlighted)
   - Click destination square to move
   - Or drag and drop pieces traditionally
4. **Game Features**:
   - View move history and captured pieces on the right
   - Click any move in history to preview that position
   - Use "New Game" or "Resign" buttons as needed
   - Toggle sound effects on/off

## 🔮 Roadmap

- **Phase 1**: ✅ Core chess gameplay with AI
- **Phase 2**: 🚧 Online multiplayer & matchmaking
- **Phase 3**: 📋 Custom board editor with point system
- **Phase 4**: 🏪 Piece shop & unlockables
- **Phase 5**: 🏆 Achievements & player profiles

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Ready to play?** Fire up the dev server and challenge our AI! 🎯
