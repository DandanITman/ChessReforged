import { doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { UserProfile } from './auth';
import type { ArmyDeck } from '@/lib/chess/deckSystem';

// Helper to convert Firestore timestamps to Date objects
function timestampToDate(timestamp: unknown): Date {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as Timestamp).toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  return new Date();
}

// Helper to prepare data for Firestore (convert Dates to server timestamps)
function prepareForFirestore(data: Record<string, unknown>): Record<string, unknown> {
  const prepared = { ...data };
  if (prepared.createdAt instanceof Date) {
    prepared.createdAt = serverTimestamp();
  }
  if (prepared.lastActive instanceof Date) {
    prepared.lastActive = serverTimestamp();
  }
  if (prepared.lastModified instanceof Date) {
    prepared.lastModified = serverTimestamp();
  }
  return prepared;
}

// Profile data synchronization
export class ProfileSync {
  private unsubscribe: (() => void) | null = null;

  // Save profile data to Firebase
  static async saveProfile(uid: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      const dataToSave = prepareForFirestore({
        ...profileData,
        lastActive: serverTimestamp()
      });
      
      await setDoc(docRef, dataToSave, { merge: true });
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  // Load profile data from Firebase
  static async loadProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Handle inventory data - ensure it's properly structured
        const inventory = { ...(data.inventory || {}) };
        
        // If inventory is missing or incomplete, ensure we have all piece types
        const requiredPieces = ['p', 'n', 'b', 'r', 'q', 'k', 'l', 's', 'd', 'c', 'e', 'w', 'a', 'h', 'm', 't'];
        for (const piece of requiredPieces) {
          if (typeof inventory[piece] !== 'number') {
            inventory[piece] = 0;
          }
        }
        
        return {
          ...data,
          inventory,
          createdAt: timestampToDate(data.createdAt),
          lastActive: timestampToDate(data.lastActive),
          stats: {
            ...data.stats,
            lastPlayed: data.stats?.lastPlayed ? timestampToDate(data.stats.lastPlayed) : undefined
          }
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading profile:', error);
      throw error;
    }
  }

  // Subscribe to real-time profile updates
  startRealtimeSync(uid: string, onUpdate: (profile: UserProfile) => void): void {
    const docRef = doc(db, 'users', uid);
    
    this.unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const profile = {
          ...data,
          createdAt: timestampToDate(data.createdAt),
          lastActive: timestampToDate(data.lastActive),
          stats: {
            ...data.stats,
            lastPlayed: data.stats?.lastPlayed ? timestampToDate(data.stats.lastPlayed) : undefined
          }
        } as UserProfile;
        
        onUpdate(profile);
      }
    }, (error) => {
      console.error('Error in profile sync:', error);
    });
  }

  // Stop real-time sync
  stopRealtimeSync(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

// Army deck synchronization
export class DeckSync {
  // Save user's army decks to Firebase
  static async saveDecks(uid: string, decks: ArmyDeck[]): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid, 'data', 'armyDecks');
      await setDoc(docRef, {
        decks: decks.map(deck => ({
          ...deck,
          lastModified: serverTimestamp()
        })),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving decks:', error);
      throw error;
    }
  }

  // Load user's army decks from Firebase
  static async loadDecks(uid: string): Promise<ArmyDeck[]> {
    try {
      const docRef = doc(db, 'users', uid, 'data', 'armyDecks');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.decks?.map((deck: Record<string, unknown>) => ({
          ...deck,
          lastModified: timestampToDate(deck.lastModified)?.getTime() || Date.now()
        })) || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error loading decks:', error);
      throw error;
    }
  }

  // Save individual deck
  static async saveDeck(uid: string, deck: ArmyDeck): Promise<void> {
    try {
      // Load all decks, update the specific one, then save back
      const allDecks = await this.loadDecks(uid);
      const updatedDecks = allDecks.map(d => 
        d.id === deck.id 
          ? { ...deck, lastModified: Date.now() }
          : d
      );
      
      // If deck doesn't exist, add it
      if (!allDecks.find(d => d.id === deck.id)) {
        updatedDecks.push({ ...deck, lastModified: Date.now() });
      }
      
      await this.saveDecks(uid, updatedDecks);
    } catch (error) {
      console.error('Error saving individual deck:', error);
      throw error;
    }
  }
}

// Game statistics synchronization
export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winStreaks: number;
  lastPlayed?: Date;
}

export class StatsSync {
  // Update game statistics
  static async updateGameStats(uid: string, outcome: 'win' | 'loss' | 'draw'): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        const currentStats = currentData.stats || {
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winStreaks: 0
        };

        const newStats = {
          ...currentStats,
          gamesPlayed: currentStats.gamesPlayed + 1,
          wins: currentStats.wins + (outcome === 'win' ? 1 : 0),
          losses: currentStats.losses + (outcome === 'loss' ? 1 : 0),
          draws: currentStats.draws + (outcome === 'draw' ? 1 : 0),
          winStreaks: outcome === 'win' ? currentStats.winStreaks + 1 : 0,
          lastPlayed: serverTimestamp()
        };

        await updateDoc(docRef, { stats: newStats });
      }
    } catch (error) {
      console.error('Error updating game stats:', error);
      throw error;
    }
  }

  // Update ELO rating
  static async updateEloRating(
    uid: string, 
    gameType: 'standardCasual' | 'standardRanked' | 'classicalCasual' | 'classicalRanked', 
    newRating: number
  ): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        [`ratings.${gameType}`]: newRating,
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating ELO rating:', error);
      throw error;
    }
  }
}

// Inventory synchronization
export class InventorySync {
  // Save inventory to Firebase
  static async saveInventory(uid: string, inventory: Record<string, number>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        inventory,
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving inventory:', error);
      throw error;
    }
  }

  // Update credits/orbs/exp
  static async updateCurrency(
    uid: string, 
    updates: { credits?: number; orbs?: number; exp?: number }
  ): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        ...updates,
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating currency:', error);
      throw error;
    }
  }
}

// Debounced save utility to prevent excessive Firebase writes
export class DebouncedSave {
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  debounce(key: string, fn: () => Promise<void>, delay: number = 2000): void {
    // Clear existing timeout for this key
    const existingTimeout = this.timeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      try {
        await fn();
        this.timeouts.delete(key);
      } catch (error) {
        console.error(`Debounced save error for ${key}:`, error);
        this.timeouts.delete(key);
      }
    }, delay);

    this.timeouts.set(key, timeout);
  }

  // Force immediate save and clear timeout
  async flush(key: string): Promise<void> {
    const timeout = this.timeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(key);
    }
  }

  // Clear all pending saves
  clearAll(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }
}