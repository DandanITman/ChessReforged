export interface LevelInfo {
  currentLevel: number;
  currentExp: number;
  expForCurrentLevel: number;
  expForNextLevel: number;
  expToNextLevel: number;
  progressPercentage: number;
}

export class LevelSystem {
  // Experience required for each level based on requirements
  private static getExpForLevel(level: number): number {
    if (level <= 1) return 0;
    if (level === 2) return 250; // Level 1 to 2 takes 250 exp
    if (level === 3) return 250; // Level 2 to 3 takes 250 exp
    if (level === 4) return 500; // Level 3 to 4 takes 500 exp
    if (level === 5) return 750; // Level 4 to 5 takes 750 exp
    return 1000; // Level 5+ takes 1000 exp each
  }

  // Calculate total experience needed to reach a specific level
  private static getTotalExpForLevel(level: number): number {
    let totalExp = 0;
    for (let i = 2; i <= level; i++) {
      totalExp += LevelSystem.getExpForLevel(i);
    }
    return totalExp;
  }

  // Get level info from total experience
  static getLevelInfo(totalExp: number): LevelInfo {
    let currentLevel = 1;
    let expUsed = 0;

    // Find current level
    while (true) {
      const expNeededForNextLevel = LevelSystem.getExpForLevel(currentLevel + 1);
      if (expUsed + expNeededForNextLevel > totalExp) {
        break;
      }
      expUsed += expNeededForNextLevel;
      currentLevel++;
    }

    const currentExp = totalExp - expUsed;
    const expForCurrentLevel = LevelSystem.getExpForLevel(currentLevel);
    const expForNextLevel = LevelSystem.getExpForLevel(currentLevel + 1);
    const expToNextLevel = expForNextLevel - currentExp;
    const progressPercentage = expForNextLevel > 0 ? (currentExp / expForNextLevel) * 100 : 100;

    return {
      currentLevel,
      currentExp,
      expForCurrentLevel,
      expForNextLevel,
      expToNextLevel,
      progressPercentage: Math.min(100, Math.max(0, progressPercentage))
    };
  }

  // Get experience needed to reach a target level from current experience
  static getExpToReachLevel(currentTotalExp: number, targetLevel: number): number {
    const targetTotalExp = LevelSystem.getTotalExpForLevel(targetLevel);
    return Math.max(0, targetTotalExp - currentTotalExp);
  }

  // Get level from total experience (simple version)
  static getLevelFromExp(totalExp: number): number {
    return LevelSystem.getLevelInfo(totalExp).currentLevel;
  }

  // Get next level title based on level
  static getLevelTitle(level: number): string {
    if (level >= 100) return 'Grandmaster';
    if (level >= 80) return 'Master';
    if (level >= 60) return 'Expert';
    if (level >= 40) return 'Advanced';
    if (level >= 20) return 'Intermediate';
    if (level >= 10) return 'Novice';
    return 'Beginner';
  }

  // Get level color theme
  static getLevelColor(level: number): string {
    if (level >= 100) return 'text-purple-500';
    if (level >= 80) return 'text-red-500';
    if (level >= 60) return 'text-orange-500';
    if (level >= 40) return 'text-yellow-500';
    if (level >= 20) return 'text-green-500';
    if (level >= 10) return 'text-blue-500';
    return 'text-gray-500';
  }
}