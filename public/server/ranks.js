/**
 * Rank System for Flag Wars
 * Tanki Online style ranks with XP progression
 */

const RANKS = [
  { id: 1, name: 'Recruit', minXP: 0, color: '#9ca3af', icon: '⬜' },
  { id: 2, name: 'Private', minXP: 100, color: '#6b7280', icon: '▫️' },
  { id: 3, name: 'Gefreiter', minXP: 500, color: '#4ade80', icon: '🟢' },
  { id: 4, name: 'Corporal', minXP: 1500, color: '#22c55e', icon: '🟩' },
  { id: 5, name: 'Master Corporal', minXP: 3700, color: '#16a34a', icon: '💚' },
  { id: 6, name: 'Sergeant', minXP: 7100, color: '#fbbf24', icon: '🟡' },
  { id: 7, name: 'Staff Sergeant', minXP: 12300, color: '#f59e0b', icon: '🟨' },
  { id: 8, name: 'Master Sergeant', minXP: 20000, color: '#d97706', icon: '🧡' },
  { id: 9, name: 'First Sergeant', minXP: 29000, color: '#ea580c', icon: '🟠' },
  { id: 10, name: 'Sergeant Major', minXP: 41000, color: '#dc2626', icon: '🔴' },
  { id: 11, name: 'Warrant Officer 1', minXP: 57000, color: '#b91c1c', icon: '🟥' },
  { id: 12, name: 'Warrant Officer 2', minXP: 76000, color: '#991b1b', icon: '❤️' },
  { id: 13, name: 'Warrant Officer 3', minXP: 98000, color: '#7f1d1d', icon: '💔' },
  { id: 14, name: 'Warrant Officer 4', minXP: 125000, color: '#3b82f6', icon: '🔵' },
  { id: 15, name: 'Warrant Officer 5', minXP: 156000, color: '#2563eb', icon: '🟦' },
  { id: 16, name: 'Third Lieutenant', minXP: 192000, color: '#1d4ed8', icon: '💙' },
  { id: 17, name: 'Second Lieutenant', minXP: 233000, color: '#1e40af', icon: '🔷' },
  { id: 18, name: 'First Lieutenant', minXP: 280000, color: '#a855f7', icon: '🟣' },
  { id: 19, name: 'Captain', minXP: 332000, color: '#9333ea', icon: '🟪' },
  { id: 20, name: 'Major', minXP: 390000, color: '#7c3aed', icon: '💜' },
  { id: 21, name: 'Lieutenant Colonel', minXP: 455000, color: '#6d28d9', icon: '💎' },
  { id: 22, name: 'Colonel', minXP: 527000, color: '#5b21b6', icon: '🔮' },
  { id: 23, name: 'Brigadier', minXP: 606000, color: '#fcd34d', icon: '⭐' },
  { id: 24, name: 'Major General', minXP: 692000, color: '#fbbf24', icon: '🌟' },
  { id: 25, name: 'Lieutenant General', minXP: 787000, color: '#f59e0b', icon: '✨' },
  { id: 26, name: 'General', minXP: 889000, color: '#d97706', icon: '🏆' },
  { id: 27, name: 'Marshal', minXP: 1000000, color: '#b45309', icon: '👑' },
  { id: 28, name: 'Generalissimo', minXP: 1500000, color: '#92400e', icon: '🎖️' },
  { id: 29, name: 'Legend', minXP: 2500000, color: '#78350f', icon: '🌠' },
];

// XP rewards for actions
const XP_REWARDS = {
  kill: 10,
  assist: 5,
  flagCapture: 50,
  flagReturn: 20,
  damageDealt: 0.01, // per damage point
  win: 100,
  loss: 25,
  participation: 5, // per minute in battle
};

/**
 * Get rank for given XP amount
 */
function getRankForXP(xp) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXP) {
      rank = r;
    } else {
      break;
    }
  }
  return rank;
}

/**
 * Get next rank info
 */
function getNextRank(xp) {
  const currentRank = getRankForXP(xp);
  const nextRankIndex = RANKS.findIndex(r => r.id === currentRank.id) + 1;
  
  if (nextRankIndex >= RANKS.length) {
    return null; // Max rank reached
  }
  
  const nextRank = RANKS[nextRankIndex];
  return {
    rank: nextRank,
    xpNeeded: nextRank.minXP - xp,
    progress: (xp - currentRank.minXP) / (nextRank.minXP - currentRank.minXP),
  };
}

/**
 * Calculate XP for a battle result
 */
function calculateBattleXP(stats) {
  let xp = 0;
  
  xp += (stats.kills || 0) * XP_REWARDS.kill;
  xp += (stats.assists || 0) * XP_REWARDS.assist;
  xp += (stats.flagCaptures || 0) * XP_REWARDS.flagCapture;
  xp += (stats.flagReturns || 0) * XP_REWARDS.flagReturn;
  xp += Math.floor((stats.damageDealt || 0) * XP_REWARDS.damageDealt);
  
  if (stats.won) {
    xp += XP_REWARDS.win;
  } else {
    xp += XP_REWARDS.loss;
  }
  
  xp += Math.floor((stats.battleDurationMinutes || 0) * XP_REWARDS.participation);
  
  return Math.floor(xp);
}

/**
 * Check if player ranked up
 */
function checkRankUp(oldXP, newXP) {
  const oldRank = getRankForXP(oldXP);
  const newRank = getRankForXP(newXP);
  
  if (newRank.id > oldRank.id) {
    return {
      rankedUp: true,
      oldRank,
      newRank,
      levelsGained: newRank.id - oldRank.id,
    };
  }
  
  return { rankedUp: false };
}

module.exports = {
  RANKS,
  XP_REWARDS,
  getRankForXP,
  getNextRank,
  calculateBattleXP,
  checkRankUp,
};
