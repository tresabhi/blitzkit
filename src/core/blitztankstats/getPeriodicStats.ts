export interface Period {
  statsId: number;
  account_id: number;
  tank_id: number;
  recordDate: string;
  last_battle_time: number;
  fromDate: string;
  prior_battle_time: number;
  battles: number;
  wins: number;
  losses: number;
  spotted: number;
  shots: number;
  hits: number;
  xp: number;
  battle_life_time: number;
  frags: number;
  max_frags: number;
  damage_dealt: number;
  damage_received: number;
  survived_battles: number;
  win_and_survived: number;
  capture_points: number;
  dropped_capture_points: number;
  killStealerValue: number;
  isRating: boolean;
  wn8: number;
  region: string;
}

export default async function getPeriodicStats(id: number, period: number) {
  const response = await fetch(
    `https://blitztankstats.com/api/Stats/period/${id}/${period}`,
  );
  return (await response.json()) as Period[];
}
