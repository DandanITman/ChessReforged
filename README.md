# ♟️ Chess Reforged

> **A modern, feature-rich chess experience built for the web**

Welcome to Chess Reforged - where classic chess meets modern web technology! This isn't just another chess app; it's a complete chess platform with AI opponents, comprehensive user profiles, customizable settings, and an intuitive interface that rivals the best chess websites.

## ✨ Features

### 🎮 **Multiple Game Modes**
- **Human vs Human** - Challenge friends locally
- **Human vs Bot** - Face off against our AI with 3 difficulty levels
- **Setup Screen** - Choose your side and difficulty before battle
- **Board Editor** - Create custom starting positions with point-based army building
- **Shop System** - Unlock new pieces and themes (coming soon)

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

### 👤 **Complete Profile System**
- **User Profiles** - Comprehensive player statistics and information
- **Game History** - Track all your games with detailed results
- **Achievement System** - Unlock achievements and track progress
- **Rating System** - ELO-style rating with rank progression
- **Personal Stats** - Win rate, games played, favorite openings, and more

### ⚙️ **Advanced Settings & Customization**
- **Game Preferences** - Customize board themes, piece sets, and animations
- **Sound Controls** - Fine-tune audio settings and effects
- **Notification Management** - Control what alerts you receive
- **Privacy Settings** - Manage profile visibility and account security
- **Theme Selection** - Light, dark, or system-based themes
- **Regional Settings** - Language and timezone customization

### 🎨 **Beautiful Modern Interface**
- High-quality 256x256 chess piece sprites
- Modern gradient card designs throughout
- Smooth animations and visual feedback
- Professional-grade UI components
- Responsive design for all devices
- Consistent color scheme and typography

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/DandanITman/ChessReforged.git
cd ChessReforged

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
│   ├── play/bot/          # Bot game modes with setup and match pages
│   ├── profile/           # User profile and statistics
│   ├── settings/          # Comprehensive settings management
│   ├── editor/            # Board editor with custom army building
│   ├── shop/              # Piece shop and inventory system
│   └── achievements/      # Achievement tracking and display
├── components/            # React components
│   ├── BotChessBoard.tsx  # Main chess board with AI
│   ├── MoveHistoryPanel.tsx # Move history & captures
│   ├── EditorBoard.tsx    # Board editor with drag & drop
│   ├── TopBar.tsx         # Navigation with profile integration
│   └── ui/                # shadcn/ui components (Button, Card, Badge, etc.)
├── lib/
│   ├── bot/               # AI chess bot logic with difficulty levels
│   ├── chess/             # Chess utilities, sprites, and placement rules
│   ├── sound/             # Sound effects manager
│   └── store/             # Zustand state management (game, profile, editor)
public/
├── pieces/                # High-quality chess piece PNG sprites
└── sounds/                # Sound effects for immersive gameplay
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
5. **Profile & Progress**:
   - Visit your profile to see stats and recent games
   - Track achievements and rating progression
   - Customize settings for optimal experience
6. **Board Editor**:
   - Create custom starting positions with point budgets
   - Experiment with different army compositions
   - Save and share your custom setups

## 🔮 Roadmap

- **Phase 1**: ✅ Core chess gameplay with AI
- **Phase 2**: ✅ Profile system and user management
- **Phase 3**: ✅ Custom board editor with point system
- **Phase 4**: 🚧 Enhanced shop system & unlockables
- **Phase 5**: 🚧 Online multiplayer & matchmaking
- **Phase 6**: 📋 Tournament system and leaderboards
- **Phase 7**: 🎨 Advanced themes and customization

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🌟 What's New in Latest Version

### v2.0 - Complete Platform Overhaul
- **🎨 Modern UI Design**: Complete visual redesign with gradient cards and professional styling
- **👤 User Profiles**: Comprehensive profile system with stats, game history, and achievements
- **⚙️ Advanced Settings**: Full customization options for gameplay, appearance, and preferences
- **🧭 Enhanced Navigation**: Improved menu system with profile integration
- **🏪 Shop System**: Enhanced inventory management and piece collection
- **📝 Board Editor**: Improved custom army builder with better controls
- **🎮 Better Game Flow**: Enhanced bot setup and game management

### Previous Updates
- **v1.5**: Chess.com-style gameplay with sound effects
- **v1.0**: Core chess engine with AI opponents
- **v0.5**: Basic board and piece movement
- **v0.1**: Initial project scaffold

---

**Ready to experience the future of web chess?** Fire up the dev server and dive into Chess Reforged! 🎯♟️
