# Firebase Integration Plan for Chess Reforged

## Overview
Transform Chess Reforged into a fully functional multiplayer chess platform using Firebase for authentication, real-time gameplay, and data persistence. This will enable mobile app development and production deployment.

## 🔥 Firebase Services to Use

### Authentication
- **Firebase Auth** with multiple providers:
  - Google Sign-In
  - Apple Sign-In 
  - Discord OAuth
  - Email/Password (fallback)

### Database
- **Firestore** for real-time data synchronization
- **Cloud Storage** for user avatars and game assets

### Real-time Features
- **Firestore Real-time Listeners** for live gameplay
- **Cloud Functions** for game logic validation

## 📊 Database Schema Design

### Users Collection (`/users/{userId}`)
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google' | 'apple' | 'discord' | 'email';
  
  // Profile Data
  level: number;
  credits: number;
  orbs: number;
  
  // ELO Ratings (separate for each game type)
  ratings: {
    standardCasual: number;
    standardRanked: number;
    classicalCasual: number;
    classicalRanked: number;
  };
  
  // Game Statistics
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    winStreaks: number;
    lastPlayed: Timestamp;
  };
  
  // Inventory
  inventory: Record<PieceType, number>;
  
  // Settings
  settings: {
    soundEnabled: boolean;
    theme: string;
    notifications: boolean;
  };
  
  createdAt: Timestamp;
  lastActive: Timestamp;
}
```

### Army Decks Collection (`/users/{userId}/decks/{deckId}`)
```typescript
interface ArmyDeck {
  id: string;
  name: string;
  description: string;
  color: 'w' | 'b';
  placed: Record<Square, EditorPiece>;
  isMain: boolean;
  createdAt: Timestamp;
  lastModified: Timestamp;
}
```

### Games Collection (`/games/{gameId}`)
```typescript
interface Game {
  id: string;
  
  // Players
  players: {
    white: {
      uid: string;
      displayName: string;
      rating: number;
      deck?: ArmyDeck; // For standard games
    };
    black: {
      uid: string;
      displayName: string;
      rating: number;
      deck?: ArmyDeck; // For standard games
    };
  };
  
  // Game Configuration
  gameType: 'standard' | 'classical';
  gameMode: 'casual' | 'ranked' | 'friend';
  timeControl: TimeControl;
  
  // Game State
  status: 'waiting' | 'active' | 'completed' | 'abandoned';
  currentFen: string;
  customPieceMapping?: CustomPieceMapping;
  turn: 'w' | 'b';
  
  // Move History
  moves: Array<{
    ply: number;
    san: string;
    from: Square;
    to: Square;
    piece: PieceSymbol;
    captured?: PieceSymbol;
    promotion?: PieceSymbol;
    timestamp: Timestamp;
    timeLeft: { white: number; black: number };
  }>;
  
  // Game Result
  result?: {
    winner: 'white' | 'black' | 'draw';
    reason: 'checkmate' | 'timeout' | 'resignation' | 'stalemate' | 'draw';
    ratingChanges: {
      white: { old: number; new: number; change: number };
      black: { old: number; new: number; change: number };
    };
  };
  
  // Timestamps
  createdAt: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
}
```

### Matchmaking Queue (`/matchmaking/{queueId}`)
```typescript
interface MatchmakingEntry {
  uid: string;
  displayName: string;
  rating: number;
  gameType: 'standard' | 'classical';
  gameMode: 'casual' | 'ranked';
  timeControl: TimeControl;
  preferredColor?: 'w' | 'b' | 'random';
  deck?: ArmyDeck; // For standard games
  createdAt: Timestamp;
  expiresAt: Timestamp;
}
```

### Tournaments Collection (`/tournaments/{tournamentId}`)
```typescript
interface Tournament {
  id: string;
  name: string;
  description: string;
  format: 'swiss' | 'knockout' | 'roundRobin';
  gameType: 'standard' | 'classical';
  timeControl: TimeControl;
  
  // Participation
  maxPlayers: number;
  entryFee: number;
  prizePool: number;
  
  // Status
  status: 'upcoming' | 'registration' | 'active' | 'completed';
  participants: Array<{
    uid: string;
    displayName: string;
    rating: number;
    score: number;
    tiebreakers: number[];
  }>;
  
  // Schedule
  startTime: Timestamp;
  endTime?: Timestamp;
  rounds: Array<{
    roundNumber: number;
    pairings: Array<{
      white: string;
      black: string;
      gameId?: string;
      result?: 'white' | 'black' | 'draw';
    }>;
  }>;
}
```

## 🏗️ Architecture Components

### Authentication System
1. **AuthContext** - React context for user state management
2. **AuthProvider** - Wraps app with authentication logic
3. **Protected Routes** - Guards for authenticated content
4. **Social Login Integration** - OAuth providers setup

### Real-time Game Engine
1. **GameManager** - Handles game state synchronization
2. **MoveValidator** - Server-side move validation via Cloud Functions
3. **Matchmaking Service** - Queue management and pairing
4. **Rating Calculator** - ELO updates after games

### Data Synchronization
1. **FirebaseProfileStore** - Replaces local profile store
2. **FirebaseDeckStore** - Syncs Army Builder decks
3. **InventorySync** - Real-time inventory updates
4. **OfflineSupport** - Caches data for offline access

## 🔧 Implementation Steps

### Phase 1: Authentication Setup
1. Install Firebase SDK and configure project
2. Set up OAuth providers (Google, Apple, Discord)
3. Create authentication context and hooks
4. Update login/register pages with Firebase integration
5. Add protected route components

### Phase 2: User Data Migration
1. Migrate existing Zustand stores to Firebase
2. Create user profile sync system
3. Implement Army Builder deck synchronization
4. Add inventory and purchase tracking

### Phase 3: Real-time Multiplayer
1. Implement game session management
2. Create real-time move synchronization
3. Add matchmaking queue system
4. Implement spectator mode for live games

### Phase 4: Advanced Features
1. Tournament system implementation
2. Friend system and private games
3. Leaderboards and statistics
4. Push notifications for mobile

## 🔐 Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow reading basic profile info for matchmaking
      allow read: if request.auth != null && 
        resource.data.keys().hasOnly(['displayName', 'rating', 'level']);
    }
    
    // Users can read/write their own decks
    match /users/{userId}/decks/{deckId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Games - players can read/write games they're participating in
    match /games/{gameId} {
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.players.white.uid ||
        request.auth.uid == resource.data.players.black.uid
      );
      
      allow write: if request.auth != null && (
        request.auth.uid == resource.data.players.white.uid ||
        request.auth.uid == resource.data.players.black.uid
      ) && validateMove();
    }
    
    // Matchmaking queue
    match /matchmaking/{queueId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
    
    // Tournaments - public read, admin write
    match /tournaments/{tournamentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isAdmin();
    }
  }
}
```

## 📱 Mobile App Considerations

### React Native Compatibility
- Firebase SDK works seamlessly with React Native
- Shared codebase for web and mobile
- Platform-specific authentication flows

### Offline Support
- Firestore offline persistence
- Local game state caching
- Sync when connection restored

### Push Notifications
- Firebase Cloud Messaging
- Game invitations and move notifications
- Tournament announcements

## 🚀 Deployment Strategy

### Development Environment
1. Firebase project setup
2. Authentication provider configuration
3. Firestore database rules deployment
4. Cloud Functions for game validation

### Production Deployment
1. Environment variable configuration
2. Security rules validation
3. Performance monitoring setup
4. Analytics integration

## 💰 Cost Estimation

### Firebase Pricing (Free Tier Limits)
- **Authentication**: 50,000 MAU free
- **Firestore**: 50,000 reads, 20,000 writes, 20,000 deletes per day
- **Cloud Functions**: 2M invocations per month
- **Storage**: 5GB free

### Scaling Considerations
- Database optimization for read/write efficiency
- Batch operations for inventory updates
- Connection pooling for real-time games
- CDN for static assets

## ✅ Success Metrics

### Technical Goals
- [ ] 100% authentication success rate
- [ ] < 100ms move synchronization latency
- [ ] 99.9% uptime for matchmaking
- [ ] Offline support for critical features

### User Experience Goals
- [ ] Seamless cross-platform experience
- [ ] Real-time multiplayer with < 1s delay
- [ ] Persistent user data across devices
- [ ] Social features (friends, spectating)

## 🔄 Migration Plan

### Existing Data
1. Export current Zustand store data
2. Transform to Firebase schema
3. Bulk import user profiles and decks
4. Validate data integrity

### Gradual Rollout
1. Beta testing with Firebase authentication
2. Incremental feature migration
3. A/B testing for performance comparison
4. Full production deployment

This comprehensive Firebase integration will transform Chess Reforged into a production-ready, scalable multiplayer chess platform suitable for both web and mobile deployment.