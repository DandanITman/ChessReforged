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

      // Unlock 1 of each piece type for army builder
      const allPiecesInventory = {
        // Standard pieces (keep existing amounts if higher)
        'inventory.p': 8, // Pawns
        'inventory.n': 2, // Knights
        'inventory.b': 2, // Bishops
        'inventory.r': 2, // Rooks
        'inventory.q': 1, // Queen
        'inventory.k': 1, // King
        // Custom pieces (unlock 1 of each)
        'inventory.l': 1, // Lion
        'inventory.s': 1, // Soldier
        'inventory.d': 1, // Dragon
        'inventory.c': 1, // Catapult
        'inventory.e': 1, // Elephant
        'inventory.w': 1, // Wizard
        'inventory.a': 1, // Archer
        'inventory.h': 1, // Ship
        'inventory.m': 1, // Knight Commander
        'inventory.t': 1, // Tower Golem
      };

      await updateDoc(userRef, allPiecesInventory);
    } catch (error) {
      console.error('Error unlocking all pieces:', error);
      throw error;
    }
  }
}