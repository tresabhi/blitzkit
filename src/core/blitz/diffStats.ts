import { AllStats } from '../../types/accountInfo';

export default function diffStats(stats1: AllStats, stats2: AllStats) {
  function diff(value: (allStats: AllStats) => number) {
    return value(stats2) - value(stats1);
  }
  function max(value: (allStats: AllStats) => number) {
    return Math.max(value(stats1), value(stats2));
  }

  return {
    battles: diff((a) => a.battles),
    wins: diff((a) => a.wins),
    capture_points: diff((a) => a.capture_points),
    damage_dealt: diff((a) => a.damage_dealt),
    damage_received: diff((a) => a.damage_received),
    dropped_capture_points: diff((a) => a.dropped_capture_points),
    frags: diff((a) => a.frags),
    frags8p: diff((a) => a.frags8p),
    hits: diff((a) => a.hits),
    losses: diff((a) => a.losses),
    max_frags: max((a) => a.max_frags),
    max_xp: max((a) => a.max_xp),
    shots: diff((a) => a.shots),
    spotted: diff((a) => a.spotted),
    survived_battles: diff((a) => a.survived_battles),
    win_and_survived: diff((a) => a.win_and_survived),
    xp: diff((a) => a.xp),
  } satisfies AllStats;
}
