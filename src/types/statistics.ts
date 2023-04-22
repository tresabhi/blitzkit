export interface PeriodStatistics {
  all: {
    spotted: number;
    hits: number;
    frags: number;
    wins: number;
    losses: number;
    capture_points: number;
    battles: number;
    damage_dealt: number;
    damage_received: number;
    shots: number;
    frags8p: number;
    xp: number;
    win_and_survived: number;
    survived_battles: number;
    dropped_capture_points: number;
  };
  special: {
    winrate: number;
    damageRatio: number;
    kdr: number;
    dpb: number;
    kpb: number;
    hpb: number;
    spb: number;
    hitRate: number;
    survivalRate: number;
  };

  wn7: number;
  wn8: number;
  avg_tier: number;
  pwp: number;
}

export interface PlayerStatistics {
  statistics: PeriodStatistics;
  period30d: PeriodStatistics;
  period90d: PeriodStatistics;

  _id: string;
  nickname: string;
  nickname_lowercase: string;
  region: string;
  last_battle_time: number;
  __v: number;
  updatedAt: string;
  createdAt: string;
}
