import { calculateWN8 } from '../calculateWN8';

export const blitzStatsKeys = [
  'battles',
  'capture_points',
  'damage_dealt',
  'damage_received',
  'dropped_capture_points',
  'frags',
  'frags8p',
  'hits',
  'losses',
  'max_frags',
  'max_xp',
  'shots',
  'spotted',
  'survived_battles',
  'win_and_survived',
  'wins',
  'xp',
] as const;

export const blitzkitStatsKeys = [
  ...blitzStatsKeys,
  'battle_life_time',
] as const;

export const blitzPlayerStatsKeys = [
  ...blitzStatsKeys,
  'max_frags_tank_id',
  'max_xp_tank_id',
] as const;

export const compositeStatsKeysBase = [
  ...blitzkitStatsKeys,
  'damage_ratio',
  'kills_to_death_ratio',
  'accuracy',
  'inaccuracy',
  'misses',
  'deaths',
  'wn8',
] as const;

const normalizedBlitzStatsKeys = [
  // 'battles', will result in 1
  // 'capture_points', not all battles are encounter mode
  'damage_dealt',
  'damage_received',
  // 'dropped_capture_points', not all battles are encounter mode
  'frags',
  // 'frags8p', null on most tanks and not all battles have tier 8 and above tanks
  'hits',
  'losses',
  // 'max_frags', counts the max; not cumulative
  // 'max_xp', counts the max; not cumulative
  'shots',
  'spotted',
  'survived_battles',
  'win_and_survived',
  'wins',
  'xp',
] satisfies (typeof blitzStatsKeys)[number][];

const normalizedBlitzkitStatsKeys = [
  ...normalizedBlitzStatsKeys,
  'battle_life_time',
] satisfies (typeof blitzkitStatsKeys)[number][];

const cumulativeBlitzStatsKeys = [
  'battles',
  'capture_points',
  'damage_dealt',
  'damage_received',
  'dropped_capture_points',
  'frags',
  // 'frags8p', once again, just a painful metric
  'hits',
  'losses',
  // 'max_frags', static, not cumulative
  // 'max_xp', static, not cumulative
  'shots',
  'spotted',
  'survived_battles',
  'win_and_survived',
  'wins',
  'xp',
] satisfies (typeof blitzStatsKeys)[number][];

const cumulativeBlitzkitStatsKeys = [
  ...cumulativeBlitzStatsKeys,
  'battle_life_time',
] satisfies (typeof blitzkitStatsKeys)[number][];

const normalizedCompositeStatsKeys = [
  ...normalizedBlitzkitStatsKeys,
  // 'damage_ratio', is a dimensionless ratio
  // 'kills_to_death_ratio', also a dimensionless ratio
  // 'accuracy', dimensionless ratio
  // 'inaccuracy', dimensionless ratio
  'misses',
  'deaths',
  // 'wn8', is based on a sample of all battles so doesn't make sense to normalize
] satisfies (typeof compositeStatsKeysBase)[number][];

const cumulativeCompositeStatsKeys = [
  ...cumulativeBlitzkitStatsKeys,
  'damage_ratio',
  'kills_to_death_ratio',
  'accuracy',
  'inaccuracy',
  'misses',
  'deaths',
  'wn8',
] satisfies (typeof compositeStatsKeysBase)[number][];

export const compositeStatsKeys = [
  ...normalizedCompositeStatsKeys.map((key) => `normalized_${key}`),
  ...cumulativeCompositeStatsKeys.map((key) => `cumulative_${key}`),
] as CompositeStatsKey[];

type BlitzStatsKey = (typeof blitzStatsKeys)[number];
export type BlitzStats = Record<BlitzStatsKey, number>;

type BlitzkitStatsKey = (typeof blitzkitStatsKeys)[number];
export type BlitzkitStats = Record<BlitzkitStatsKey, number>;

type BlitzPlayerStatsKey = (typeof blitzPlayerStatsKeys)[number];
export type BlitzPlayerStats = Record<BlitzPlayerStatsKey, number>;

export type CompositeStatsKey =
  | `normalized_${(typeof normalizedCompositeStatsKeys)[number]}`
  | `cumulative_${(typeof cumulativeCompositeStatsKeys)[number]}`;
export type CompositeStats = Record<CompositeStatsKey, number>;

enum CumulationType {
  Sum,
  WeightedSum,
}

export const compositeStatsFormatting: {
  [Key in CompositeStatsKey]: {
    unit?: string;
    fixed: number;
    coefficient?: number;
    localeFormat?: boolean;
    cumulate: CumulationType;
  };
} = {
  normalized_damage_dealt: {
    fixed: 0,
    localeFormat: true,
    cumulate: CumulationType.WeightedSum,
  },
  normalized_damage_received: {
    fixed: 0,
    localeFormat: true,
    cumulate: CumulationType.WeightedSum,
  },
  normalized_deaths: {
    fixed: 0,
    unit: '%',
    coefficient: 100,
    cumulate: CumulationType.WeightedSum,
  },
  normalized_frags: {
    fixed: 2,
    cumulate: CumulationType.WeightedSum,
  },
  normalized_hits: {
    fixed: 2,
    cumulate: CumulationType.WeightedSum,
  },
  normalized_losses: {
    fixed: 0,
    unit: '%',
    coefficient: 100,
    cumulate: CumulationType.WeightedSum,
  },
  normalized_misses: {
    fixed: 2,
    cumulate: CumulationType.WeightedSum,
  },
  normalized_shots: {
    fixed: 2,
    cumulate: CumulationType.WeightedSum,
  },
  normalized_spotted: {
    fixed: 2,
    cumulate: CumulationType.WeightedSum,
  },
  normalized_survived_battles: {
    fixed: 0,
    unit: '%',
    coefficient: 100,
    cumulate: CumulationType.WeightedSum,
  },
  normalized_win_and_survived: {
    fixed: 0,
    unit: '%',
    coefficient: 100,
    cumulate: CumulationType.WeightedSum,
  },
  normalized_wins: {
    fixed: 0,
    unit: '%',
    coefficient: 100,
    cumulate: CumulationType.WeightedSum,
  },
  normalized_xp: {
    fixed: 0,
    localeFormat: true,
    cumulate: CumulationType.WeightedSum,
  },
  normalized_battle_life_time: {
    fixed: 1,
    coefficient: 1 / 60,
    cumulate: CumulationType.WeightedSum,
  },

  cumulative_accuracy: {
    fixed: 0,
    unit: '%',
    coefficient: 100,
    cumulate: CumulationType.WeightedSum,
  },
  cumulative_battles: {
    fixed: 0,
    cumulate: CumulationType.Sum,
  },
  cumulative_capture_points: {
    fixed: 2,
    cumulate: CumulationType.Sum,
  },
  cumulative_damage_dealt: {
    fixed: 0,
    localeFormat: true,
    cumulate: CumulationType.Sum,
  },
  cumulative_damage_ratio: {
    fixed: 2,
    cumulate: CumulationType.WeightedSum,
  },
  cumulative_damage_received: {
    fixed: 0,
    localeFormat: true,
    cumulate: CumulationType.Sum,
  },
  cumulative_deaths: {
    fixed: 0,
    cumulate: CumulationType.Sum,
  },
  cumulative_dropped_capture_points: {
    fixed: 2,
    cumulate: CumulationType.Sum,
  },
  cumulative_frags: {
    fixed: 0,
    cumulate: CumulationType.Sum,
  },
  cumulative_hits: {
    fixed: 0,
    cumulate: CumulationType.Sum,
  },
  cumulative_inaccuracy: {
    fixed: 0,
    unit: '%',
    coefficient: 100,
    cumulate: CumulationType.WeightedSum,
  },
  cumulative_kills_to_death_ratio: {
    fixed: 2,
    cumulate: CumulationType.WeightedSum,
  },
  cumulative_losses: {
    fixed: 0,
    cumulate: CumulationType.Sum,
  },
  cumulative_misses: {
    fixed: 0,
    cumulate: CumulationType.Sum,
  },
  cumulative_shots: {
    fixed: 0,
    cumulate: CumulationType.Sum,
  },
  cumulative_spotted: {
    fixed: 0,
    cumulate: CumulationType.Sum,
  },
  cumulative_survived_battles: {
    fixed: 0,
    cumulate: CumulationType.Sum,
  },
  cumulative_win_and_survived: {
    fixed: 0,
    cumulate: CumulationType.Sum,
  },
  cumulative_wins: {
    fixed: 0,
    cumulate: CumulationType.Sum,
  },
  cumulative_xp: {
    fixed: 0,
    localeFormat: true,
    cumulate: CumulationType.Sum,
  },
  cumulative_wn8: {
    fixed: 0,
    localeFormat: false,
    cumulate: CumulationType.WeightedSum,
  },
  cumulative_battle_life_time: {
    fixed: 0,
    coefficient: 1 / 60,
    localeFormat: true,
    cumulate: CumulationType.Sum,
  },
};

export function calculateCompositeStats(s: BlitzkitStats, a: BlitzStats) {
  return {
    cumulative_accuracy: s.hits / s.shots,
    cumulative_battle_life_time: s.battle_life_time,
    cumulative_battles: s.battles,
    cumulative_capture_points: s.capture_points,
    cumulative_damage_dealt: s.damage_dealt,
    cumulative_damage_ratio: s.damage_dealt / s.damage_received,
    cumulative_damage_received: s.damage_received,
    cumulative_deaths: s.battles - s.survived_battles,
    cumulative_dropped_capture_points: s.dropped_capture_points,
    cumulative_frags: s.frags,
    cumulative_hits: s.hits,
    cumulative_inaccuracy: (s.shots - s.hits) / s.shots,
    cumulative_kills_to_death_ratio: s.frags / (s.battles - s.survived_battles),
    cumulative_losses: s.losses,
    cumulative_misses: s.shots - s.hits,
    cumulative_shots: s.shots,
    cumulative_spotted: s.spotted,
    cumulative_survived_battles: s.survived_battles,
    cumulative_win_and_survived: s.win_and_survived,
    cumulative_wins: s.wins,
    cumulative_wn8: calculateWN8(a, s),
    cumulative_xp: s.xp,
    normalized_battle_life_time: s.battle_life_time / s.battles,
    normalized_damage_dealt: s.damage_dealt / s.battles,
    normalized_damage_received: s.damage_received / s.battles,
    normalized_deaths: (s.battles - s.survived_battles) / s.battles,
    normalized_frags: s.frags / s.battles,
    normalized_hits: s.hits / s.battles,
    normalized_losses: s.losses / s.battles,
    normalized_misses: (s.shots - s.hits) / s.battles,
    normalized_shots: s.shots / s.battles,
    normalized_spotted: s.spotted / s.battles,
    normalized_survived_battles: s.survived_battles / s.battles,
    normalized_win_and_survived: s.win_and_survived / s.battles,
    normalized_wins: s.wins / s.battles,
    normalized_xp: s.xp / s.battles,
  } satisfies CompositeStats;
}

export function sumCompositeStats(stats: CompositeStats[]) {
  const battles = stats.reduce((a, b) => a + b.cumulative_battles, 0);
  const summed: Partial<CompositeStats> = {};

  Object.entries(compositeStatsFormatting).forEach(([key, value]) => {
    switch (value.cumulate) {
      case CumulationType.Sum: {
        summed[key as keyof CompositeStats] = stats.reduce(
          (a, b) => a + b[key as keyof CompositeStats],
          0,
        );
        break;
      }

      case CumulationType.WeightedSum: {
        summed[key as keyof CompositeStats] =
          stats.reduce(
            (a, b) => a + b[key as keyof CompositeStats] * b.cumulative_battles,
            0,
          ) / battles;
        break;
      }
    }
  });

  return summed as CompositeStats;
}
