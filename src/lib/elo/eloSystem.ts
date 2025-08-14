// ELO Rating System based on Chess.com's implementation
// Starting rating: 400
// K-factor varies based on rating and games played

export interface EloRating {
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface GameResult {
  playerRating: number;
  opponentRating: number;
  result: 'win' | 'loss' | 'draw'; // from player's perspective
  gameType: 'casual' | 'ranked';
}

export interface EloChange {
  oldRating: number;
  newRating: number;
  change: number;
  kFactor: number;
}

// Calculate K-factor based on rating and games played (similar to Chess.com)
export function calculateKFactor(rating: number, gamesPlayed: number): number {
  // New players (under 30 games) get higher K-factor for faster rating adjustment
  if (gamesPlayed < 30) {
    return 40;
  }
  
  // Players under 2100 rating
  if (rating < 2100) {
    return 32;
  }
  
  // Players 2100-2400
  if (rating < 2400) {
    return 24;
  }
  
  // Masters (2400+) get lower K-factor for more stable ratings
  return 16;
}

// Calculate expected score using ELO formula
export function calculateExpectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

// Calculate new rating after a game
export function calculateNewRating(gameResult: GameResult, gamesPlayed: number): EloChange {
  const { playerRating, opponentRating, result } = gameResult;
  
  // Don't change rating for casual games
  if (gameResult.gameType === 'casual') {
    return {
      oldRating: playerRating,
      newRating: playerRating,
      change: 0,
      kFactor: 0
    };
  }
  
  const kFactor = calculateKFactor(playerRating, gamesPlayed);
  const expectedScore = calculateExpectedScore(playerRating, opponentRating);
  
  // Actual score: 1 for win, 0.5 for draw, 0 for loss
  let actualScore: number;
  switch (result) {
    case 'win':
      actualScore = 1;
      break;
    case 'draw':
      actualScore = 0.5;
      break;
    case 'loss':
      actualScore = 0;
      break;
  }
  
  // ELO formula: New Rating = Old Rating + K × (Actual Score - Expected Score)
  const ratingChange = Math.round(kFactor * (actualScore - expectedScore));
  const newRating = Math.max(100, playerRating + ratingChange); // Minimum rating of 100
  
  return {
    oldRating: playerRating,
    newRating,
    change: ratingChange,
    kFactor
  };
}

// Get rating class/title based on ELO (similar to Chess.com)
export function getRatingClass(rating: number): { title: string; color: string; range: string } {
  if (rating < 600) {
    return { title: "Beginner", color: "text-gray-500", range: "< 600" };
  } else if (rating < 800) {
    return { title: "Novice", color: "text-green-600", range: "600-799" };
  } else if (rating < 1000) {
    return { title: "Intermediate", color: "text-blue-600", range: "800-999" };
  } else if (rating < 1200) {
    return { title: "Advanced", color: "text-purple-600", range: "1000-1199" };
  } else if (rating < 1400) {
    return { title: "Expert", color: "text-orange-600", range: "1200-1399" };
  } else if (rating < 1600) {
    return { title: "Candidate Master", color: "text-red-600", range: "1400-1599" };
  } else if (rating < 1800) {
    return { title: "FIDE Master", color: "text-yellow-600", range: "1600-1799" };
  } else if (rating < 2000) {
    return { title: "International Master", color: "text-pink-600", range: "1800-1999" };
  } else if (rating < 2200) {
    return { title: "Grandmaster", color: "text-gold-600", range: "2000-2199" };
  } else if (rating < 2400) {
    return { title: "Super Grandmaster", color: "text-emerald-600", range: "2200-2399" };
  } else {
    return { title: "World Class", color: "text-indigo-600", range: "2400+" };
  }
}

// Calculate rating percentile (approximate)
export function getRatingPercentile(rating: number): number {
  // Rough approximation based on chess rating distribution
  if (rating < 400) return 1;
  if (rating < 600) return 10;
  if (rating < 800) return 25;
  if (rating < 1000) return 40;
  if (rating < 1200) return 60;
  if (rating < 1400) return 75;
  if (rating < 1600) return 85;
  if (rating < 1800) return 92;
  if (rating < 2000) return 96;
  if (rating < 2200) return 98;
  if (rating < 2400) return 99;
  return 99.5;
}

// Generate matchmaking rating range
export function getMatchmakingRange(rating: number): { min: number; max: number } {
  // Wider range for lower rated players, tighter for higher rated
  let range: number;
  
  if (rating < 1000) {
    range = 200; // ±200 rating points
  } else if (rating < 1500) {
    range = 150; // ±150 rating points
  } else if (rating < 2000) {
    range = 100; // ±100 rating points
  } else {
    range = 75; // ±75 rating points for high rated players
  }
  
  return {
    min: Math.max(100, rating - range),
    max: rating + range
  };
}