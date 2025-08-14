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
      const currentLevel = userData?.level || 1;
      const currentExp = userData?.totalExperience || 0;

      // Calculate experience needed to reach target level
      const targetLevel = currentLevel + levels;
      const expNeeded = LevelSystem.getExpToReachLevel(currentExp, targetLevel);

      await updateDoc(userRef, {
        level: targetLevel,
        totalExperience: increment(expNeeded)
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
        orbs: increment(amount)
      });
    } catch (error) {
      console.error('Error adding orbs:', error);
      throw error;
    }
  }

  async addCoins(userId: string, amount: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        credits: increment(amount)
      });
    } catch (error) {
      console.error('Error adding coins:', error);
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
      const currentExp = userData?.totalExperience || 0;
      const newTotalExp = currentExp + amount;

      // Calculate new level based on total experience
      const newLevel = LevelSystem.getLevelFromExp(newTotalExp);

      await updateDoc(userRef, {
        totalExperience: increment(amount),
        level: newLevel
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
        wins: 0,
        losses: 0,
        draws: 0,
        gamesPlayed: 0,
        totalExperience: 0,
        level: 1,
        rating: 400
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
}