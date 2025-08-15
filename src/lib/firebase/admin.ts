import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from './config';
import { LevelSystem } from '@/lib/utils/levelSystem';

export class AdminService {
  private static instance: AdminService;
  private static readonly ADMIN_EMAIL = 'danielson183@gmail.com';

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  isAdmin(userEmail: string): boolean {
    return userEmail === AdminService.ADMIN_EMAIL;
  }

  async levelUpUser(userId: string, levels: number = 1): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);

      // Get current user data
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const currentLevel = userData?.profile?.level || userData?.level || 1;
      const currentExp = userData?.stats?.totalExperience || 0;

      // Calculate experience needed to reach target level
      const targetLevel = currentLevel + levels;
      const expNeeded = LevelSystem.getExpToReachLevel(currentExp, targetLevel);

      await updateDoc(userRef, {
        'profile.level': targetLevel,
        level: targetLevel, // Legacy field
        'stats.totalExperience': increment(expNeeded)
      });
    } catch (error) {
      console.error('Error leveling up user:', error);
      throw error;
    }
  }

  async addOrbs(userId: string, amount: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'currency.orbs': increment(amount),
        orbs: increment(amount) // Legacy field
      });
    } catch (error) {
      console.error('Error adding orbs:', error);
      throw error;
    }
  }

  async addCredits(userId: string, amount: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'currency.credits': increment(amount),
        credits: increment(amount) // Legacy field
      });
    } catch (error) {
      console.error('Error adding credits:', error);
      throw error;
    }
  }

  async setUserRating(userId: string, gameType: 'standardCasual' | 'standardRanked' | 'classicalCasual' | 'classicalRanked', rating: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`ratings.${gameType}`]: rating
      });
    } catch (error) {
      console.error('Error setting user rating:', error);
      throw error;
    }
  }

  async addExperience(userId: string, amount: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);

      // Get current user data to calculate new level
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const currentExp = userData?.stats?.totalExperience || 0;
      const newTotalExp = currentExp + amount;

      // Calculate new level based on total experience
      const newLevel = LevelSystem.getLevelFromExp(newTotalExp);

      await updateDoc(userRef, {
        'stats.totalExperience': increment(amount),
        'profile.level': newLevel,
        level: newLevel // Legacy field
      });
    } catch (error) {
      console.error('Error adding experience:', error);
      throw error;
    }
  }

  async resetUserStats(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'stats.wins': 0,
        'stats.losses': 0,
        'stats.draws': 0,
        'stats.gamesPlayed': 0,
        'stats.totalExperience': 0,
        'profile.level': 1,
        level: 1, // Legacy field
        'ratings.standardCasual': 400,
        'ratings.standardRanked': 400,
        'ratings.classicalCasual': 400,
        'ratings.classicalRanked': 400
      });
    } catch (error) {
      console.error('Error resetting user stats:', error);
      throw error;
    }
  }

  async unlockAllCosmetics(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        cosmeticsOwned: [
          'classic-wood', 'marble-elegance', 'steel-chrome', 'neon-glow', 'crystal-glass',
          'royal-set', 'medieval-set', 'modern-set', 'fantasy-set', 'crystal-set'
        ]
      });
    } catch (error) {
      console.error('Error unlocking cosmetics:', error);
      throw error;
    }
  }

  async unlockAllPieces(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);

      // Get current user data to check existing inventory
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const currentInventory = userData?.inventory || {};

      // Ensure user has at least the minimum amount of each piece
      const minPieceCounts = {
        // Standard pieces (ensure minimum amounts)
        p: 8, // Pawns
        n: 2, // Knights
        b: 2, // Bishops
        r: 2, // Rooks
        q: 1, // Queen
        k: 1, // King
        // Custom pieces (ensure at least 1 of each)
        l: 1, // Lion
        s: 1, // Soldier
        d: 1, // Dragon
        c: 1, // Catapult
        e: 1, // Elephant
        w: 1, // Wizard
        a: 1, // Archer
        h: 1, // Ship
        m: 1, // Knight Commander
        t: 1, // Tower Golem
      };

      // Build update object with only pieces that need to be increased
      const inventoryUpdates: Record<string, number> = {};

      for (const [piece, minCount] of Object.entries(minPieceCounts)) {
        const currentCount = currentInventory[piece] || 0;
        if (currentCount < minCount) {
          inventoryUpdates[`inventory.${piece}`] = minCount;
        }
      }

      // Only update if there are pieces to unlock
      if (Object.keys(inventoryUpdates).length > 0) {
        await updateDoc(userRef, inventoryUpdates);
      }
    } catch (error) {
      console.error('Error unlocking all pieces:', error);
      throw error;
    }
  }
}