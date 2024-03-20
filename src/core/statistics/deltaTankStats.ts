import {
  IndividualTankStats,
  NormalizedTankStats,
  emptyIndividualTankStats,
} from '../../types/tanksStats';

export function deltaTankStats(
  aRaw: NormalizedTankStats,
  bRaw: NormalizedTankStats,
  time?: number,
) {
  const bTanks = Object.keys(bRaw);
  const changedTanks = bTanks.filter((id) => {
    return (
      aRaw[id as unknown as number]?.all.battles !==
        bRaw[id as unknown as number].all.battles &&
      (time === undefined
        ? true
        : bRaw[id as unknown as number].last_battle_time > time)
    );
  });
  const diff = changedTanks.map((id) => {
    const a = aRaw[id as unknown as number] ?? emptyIndividualTankStats;
    const b = bRaw[id as unknown as number];

    const tankDiff = {
      account_id: b.account_id,
      battle_life_time: b.battle_life_time,
      frags: (b.frags ?? a.frags ?? 0) - (a.frags ?? 0),
      max_frags: Math.max(a.max_frags, b.max_frags),
      in_garage: b.in_garage,
      max_xp: Math.max(a.max_xp, b.max_xp),
      in_garage_updated: b.in_garage_updated,
      last_battle_time: Math.max(b.last_battle_time, a.last_battle_time),
      mark_of_mastery: b.mark_of_mastery,
      tank_id: b.tank_id,

      all: {
        battles: b.all.battles - a.all.battles,
        wins: b.all.wins - a.all.wins,
        capture_points: b.all.capture_points - a.all.capture_points,
        damage_dealt: b.all.damage_dealt - a.all.damage_dealt,
        damage_received: b.all.damage_received - a.all.damage_received,
        dropped_capture_points:
          b.all.dropped_capture_points - a.all.dropped_capture_points,
        frags: b.all.frags - a.all.frags,
        frags8p: b.all.frags8p - a.all.frags8p,
        hits: b.all.hits - a.all.hits,
        losses: b.all.losses - a.all.losses,
        max_frags: Math.max(a.max_frags, b.max_frags),
        max_xp: Math.max(a.max_xp, b.max_xp),
        shots: b.all.shots - a.all.shots,
        spotted: b.all.spotted - a.all.spotted,
        survived_battles: b.all.survived_battles - a.all.survived_battles,
        win_and_survived: b.all.win_and_survived - a.all.win_and_survived,
        xp: b.all.xp - a.all.xp,
      },
    } satisfies IndividualTankStats;

    return tankDiff;
  });
  const normalized = diff.reduce<NormalizedTankStats>(
    (accumulator, diff) => ({ ...accumulator, [diff.tank_id]: diff }),
    {},
  );

  return normalized;
}
