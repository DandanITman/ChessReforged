import React from 'react';
import { collection, doc, setDoc, onSnapshot, serverTimestamp, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';

export interface OnlinePlayer {
  uid: string;
  displayName: string;
  lastActive: Date;
  status: 'online' | 'in-game' | 'looking-for-game';
}

export class PlayerCountService {
  private static instance: PlayerCountService;
  private unsubscribe: (() => void) | null = null;
  private onlineCount = 0;
  private inGameCount = 0;
  private lookingForGameCount = 0;
  private listeners: ((counts: { online: number; inGame: number; lookingForGame: number }) => void)[] = [];

  static getInstance(): PlayerCountService {
    if (!PlayerCountService.instance) {
      PlayerCountService.instance = new PlayerCountService();
    }
    return PlayerCountService.instance;
  }

  // Update user's online status
  static async updateUserStatus(uid: string, displayName: string, status: 'online' | 'in-game' | 'looking-for-game' = 'online'): Promise<void> {
    try {
      const docRef = doc(db, 'onlinePlayers', uid);
      await setDoc(docRef, {
        uid,
        displayName,
        lastActive: serverTimestamp(),
        status
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  // Remove user from online players
  static async removeUserStatus(uid: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'onlinePlayers', uid));
    } catch (error) {
      console.error('Error removing user status:', error);
    }
  }

  // Subscribe to real-time player count updates
  subscribeToPlayerCounts(callback: (counts: { online: number; inGame: number; lookingForGame: number }) => void): void {
    this.listeners.push(callback);

    if (this.unsubscribe) {
      return; // Already subscribed
    }

    const onlinePlayersRef = collection(db, 'onlinePlayers');
    
    this.unsubscribe = onSnapshot(onlinePlayersRef, (snapshot) => {
      let online = 0;
      let inGame = 0;
      let lookingForGame = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        online++;
        
        if (data.status === 'in-game') {
          inGame++;
        } else if (data.status === 'looking-for-game') {
          lookingForGame++;
        }
      });

      this.onlineCount = online;
      this.inGameCount = inGame;
      this.lookingForGameCount = lookingForGame;

      const counts = {
        online,
        inGame,
        lookingForGame
      };

      // Notify all listeners
      this.listeners.forEach(listener => listener(counts));
    }, (error) => {
      console.error('Error in player count subscription:', error);
    });
  }

  // Unsubscribe from player count updates
  unsubscribeFromPlayerCounts(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners = [];
  }

  // Get current counts (fallback if real-time isn't available)
  getCurrentCounts(): { online: number; inGame: number; lookingForGame: number } {
    return {
      online: this.onlineCount,
      inGame: this.inGameCount,
      lookingForGame: this.lookingForGameCount
    };
  }

  // Clean up old inactive players (should be run periodically)
  static async cleanupInactivePlayers(): Promise<void> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const q = query(
        collection(db, 'onlinePlayers'),
        where('lastActive', '<', fiveMinutesAgo)
      );
      
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`Cleaned up ${snapshot.size} inactive players`);
    } catch (error) {
      console.error('Error cleaning up inactive players:', error);
    }
  }
}

// Utility hook for using player counts in components
export function usePlayerCounts() {
  const [counts, setCounts] = React.useState({ online: 0, inGame: 0, lookingForGame: 0 });

  React.useEffect(() => {
    const service = PlayerCountService.getInstance();
    
    const handleCountUpdate = (newCounts: { online: number; inGame: number; lookingForGame: number }) => {
      setCounts(newCounts);
    };

    service.subscribeToPlayerCounts(handleCountUpdate);

    return () => {
      service.unsubscribeFromPlayerCounts();
    };
  }, []);

  return counts;
}