import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// Authentication providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
const discordProvider = new OAuthProvider('oidc.discord');

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

appleProvider.setCustomParameters({
  locale: 'en'
});

discordProvider.setCustomParameters({
  guild_id: process.env.NEXT_PUBLIC_DISCORD_GUILD_ID || ''
});

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'google' | 'apple' | 'discord' | 'email';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google' | 'apple' | 'discord' | 'email';
  
  // Profile Data
  profile: {
    level: number;
  };
  
  // Currency
  currency: {
    coins: number;
    orbs: number;
  };
  
  // Legacy fields for backward compatibility
  level: number;
  credits: number;
  orbs: number;
  
  // ELO Ratings
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
    currentWinStreak: number;
    bestWinStreak: number;
    lastPlayed?: Date;
    averageGameLength?: number;
    quickestWin?: number; // in moves
    totalExperience: number;
  };
  
  // Inventory
  inventory: Record<string, number>;
  
  // Settings
  settings: {
    soundEnabled: boolean;
    theme: string;
    notifications: boolean;
  };
  
  createdAt: Date;
  lastActive: Date;
}

// Create user profile in Firestore
async function createUserProfile(user: User, provider: string): Promise<UserProfile> {
  // Default profile picture using white pawn piece
  const defaultPhotoURL = '/pieces/w-p.png';
  
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || 'Anonymous Player',
    photoURL: user.photoURL || defaultPhotoURL,
    provider: provider as 'google' | 'apple' | 'discord' | 'email',
    
    // Profile data
    profile: {
      level: 1,
    },
    
    // Currency
    currency: {
      coins: 1000,
      orbs: 100,
    },
    
    // Legacy fields for backward compatibility
    level: 1,
    credits: 1000,
    orbs: 100,
    
    // Starting ELO ratings (400 as specified)
    ratings: {
      standardCasual: 400,
      standardRanked: 400,
      classicalCasual: 400,
      classicalRanked: 400,
    },
    
    // Empty game statistics
    stats: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winStreaks: 0,
      currentWinStreak: 0,
      bestWinStreak: 0,
      totalExperience: 0,
    },
    
    // Default inventory (basic pieces)
    inventory: {
      p: 50, // 50 pawns
      n: 10, // 10 knights
      b: 10, // 10 bishops
      r: 10, // 10 rooks
      q: 5,  // 5 queens
      k: 5,  // 5 kings
    },
    
    // Default settings
    settings: {
      soundEnabled: true,
      theme: 'dark',
      notifications: true,
    },
    
    createdAt: new Date(),
    lastActive: new Date(),
  };
  
  // Save to Firestore
  await setDoc(doc(db, 'users', user.uid), {
    ...userProfile,
    createdAt: serverTimestamp(),
    lastActive: serverTimestamp(),
  });
  
  return userProfile;
}

// Get or create user profile
export async function getUserProfile(user: User): Promise<UserProfile> {
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastActive: data.lastActive?.toDate() || new Date(),
    } as UserProfile;
  } else {
    // Create new profile for first-time users
    return await createUserProfile(user, 'email');
  }
}

// Email/Password Authentication
export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<AuthUser> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name and default photo
    await updateProfile(result.user, {
      displayName,
      photoURL: '/pieces/w-p.png'
    });
    
    // Create user profile (get updated user object)
    const updatedUser = auth.currentUser!;
    await createUserProfile(updatedUser, 'email');
    
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName,
      photoURL: '/pieces/w-p.png',
      provider: 'email'
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'An error occurred during sign up');
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      provider: 'email'
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'An error occurred during sign in');
  }
}

// Social Authentication
export async function signInWithGoogle(): Promise<AuthUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // If user doesn't have a photo, set default
    if (!result.user.photoURL) {
      await updateProfile(result.user, {
        photoURL: '/pieces/w-p.png'
      });
    }
    
    // Create or update user profile
    await createUserProfile(result.user, 'google');
    
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL || '/pieces/w-p.png',
      provider: 'google'
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'An error occurred with Google sign in');
  }
}

export async function signInWithApple(): Promise<AuthUser> {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    
    // If user doesn't have a photo, set default
    if (!result.user.photoURL) {
      await updateProfile(result.user, {
        photoURL: '/pieces/w-p.png'
      });
    }
    
    // Create or update user profile
    await createUserProfile(result.user, 'apple');
    
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL || '/pieces/w-p.png',
      provider: 'apple'
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'An error occurred with Apple sign in');
  }
}

export async function signInWithDiscord(): Promise<AuthUser> {
  try {
    const result = await signInWithPopup(auth, discordProvider);
    
    // If user doesn't have a photo, set default
    if (!result.user.photoURL) {
      await updateProfile(result.user, {
        photoURL: '/pieces/w-p.png'
      });
    }
    
    // Create or update user profile
    await createUserProfile(result.user, 'discord');
    
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL || '/pieces/w-p.png',
      provider: 'discord'
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'An error occurred with Discord sign in');
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'An error occurred during sign out');
  }
}

// Update last active timestamp
export async function updateLastActive(uid: string): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid), {
      lastActive: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating last active:', error);
  }
}