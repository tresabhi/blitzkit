import { AllStats } from '../blitz/getAccountInfo';
import { emptyAllStats } from '../blitzstars/getStatsInPeriod';

export default function sumStats(allStatsCollection: AllStats[]) {
  return allStatsCollection.reduce((accumulated, current) => {
    function sum(value: (allStats: AllStats) => number) {
      return value(accumulated) + value(current);
    }
    function max(value: (allStats: AllStats) => number) {
      return Math.max(value(accumulated), value(current));
    }

    return {
      battles: sum((a) => a.battles),
      wins: sum((a) => a.wins),
      capture_points: sum((a) => a.capture_points),
      damage_dealt: sum((a) => a.damage_dealt),
      damage_received: sum((a) => a.damage_received),
      dropped_capture_points: sum((a) => a.dropped_capture_points),
      frags: sum((a) => a.frags),
      frags8p: sum((a) => a.frags8p),
      hits: sum((a) => a.hits),
      losses: sum((a) => a.losses),
      max_frags: max((a) => a.max_frags),
      max_xp: max((a) => a.max_xp),
      shots: sum((a) => a.shots),
      spotted: sum((a) => a.spotted),
      survived_battles: sum((a) => a.survived_battles),
      win_and_survived: sum((a) => a.win_and_survived),
      xp: sum((a) => a.xp),
    } satisfies AllStats;
  }, emptyAllStats);
}
