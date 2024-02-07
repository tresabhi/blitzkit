import {
  IndividualTankStats,
  NormalizedTankStats,
  emptyIndividualTankStats,
} from '../../types/tanksStats';

export function deltaTankStats(
  a: NormalizedTankStats,
  b: NormalizedTankStats,
  time?: number,
) {
  const bTanks = Object.keys(b);
  const changedTanks = bTanks.filter((id) => {
    return (
      a[id as unknown as number]?.all.battles !==
        b[id as unknown as number].all.battles &&
      (time === undefined
        ? true
        : b[id as unknown as number].last_battle_time > time)
    );
  });
  const diff = changedTanks.map((id) => {
    const aTank = a[id as unknown as number] ?? emptyIndividualTankStats;
    const bTank = b[id as unknown as number];

    const tankDiff = {
      account_id: bTank.account_id,
      battle_life_time: bTank.battle_life_time,
      frags: (bTank.frags ?? aTank.frags ?? 0) - (aTank.frags ?? 0),
      max_frags: Math.max(aTank.max_frags, bTank.max_frags),
      in_garage: bTank.in_garage,
      max_xp: Math.max(aTank.max_xp, bTank.max_xp),
      in_garage_updated: bTank.in_garage_updated,
      last_battle_time: bTank.last_battle_time - aTank.last_battle_time,
      mark_of_mastery: bTank.mark_of_mastery,
      tank_id: bTank.tank_id,

      all: {
        battles: bTank.all.battles - aTank.all.battles,
        wins: bTank.all.wins - aTank.all.wins,
        capture_points: bTank.all.capture_points - aTank.all.capture_points,
        damage_dealt: bTank.all.damage_dealt - aTank.all.damage_dealt,
        damage_received: bTank.all.damage_received - aTank.all.damage_received,
        dropped_capture_points:
          bTank.all.dropped_capture_points - aTank.all.dropped_capture_points,
        frags: bTank.all.frags - aTank.all.frags,
        frags8p: bTank.all.frags8p - aTank.all.frags8p,
        hits: bTank.all.hits - aTank.all.hits,
        losses: bTank.all.losses - aTank.all.losses,
        max_frags: Math.max(aTank.max_frags, bTank.max_frags),
        max_xp: Math.max(aTank.max_xp, bTank.max_xp),
        shots: bTank.all.shots - aTank.all.shots,
        spotted: bTank.all.spotted - aTank.all.spotted,
        survived_battles:
          bTank.all.survived_battles - aTank.all.survived_battles,
        win_and_survived:
          bTank.all.win_and_survived - aTank.all.win_and_survived,
        xp: bTank.all.xp - aTank.all.xp,
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
