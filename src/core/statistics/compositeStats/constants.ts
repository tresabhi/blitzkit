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

export const compositeStatsFormatting: {
  [Key in CompositeStatsKey]: {
    unit?: string;
    fixed: number;
    coefficient?: number;
    preview: number;
    localeFormat?: boolean;
  };
} = {
  normalized_damage_dealt: { fixed: 0, preview: 3246, localeFormat: true },
  normalized_damage_received: { fixed: 0, preview: 966, localeFormat: true },
  normalized_deaths: { fixed: 0, unit: '%', coefficient: 100, preview: 0.09 },
  normalized_frags: { fixed: 2, preview: 2.1 },
  normalized_hits: { fixed: 2, preview: 12.33 },
  normalized_losses: { fixed: 0, unit: '%', coefficient: 100, preview: 0.3 },
  normalized_misses: { fixed: 2, preview: 1.02 },
  normalized_shots: { fixed: 2, preview: 14.54 },
  normalized_spotted: { fixed: 2, preview: 2.02 },
  normalized_survived_battles: {
    fixed: 0,
    unit: '%',
    coefficient: 100,
    preview: 0.65,
  },
  normalized_win_and_survived: {
    fixed: 0,
    unit: '%',
    coefficient: 100,
    preview: 0.59,
  },
  normalized_wins: { fixed: 0, unit: '%', coefficient: 100, preview: 0.72 },
  normalized_xp: { fixed: 0, preview: 982, localeFormat: true },
  normalized_battle_life_time: { fixed: 1, preview: 4.6, coefficient: 1 / 60 },

  cumulative_accuracy: { fixed: 0, unit: '%', coefficient: 100, preview: 0.91 },
  cumulative_battles: { fixed: 0, preview: 12 },
  cumulative_capture_points: { fixed: 2, preview: 0.12 },
  cumulative_damage_dealt: { fixed: 0, preview: 45023, localeFormat: true },
  cumulative_damage_ratio: { fixed: 2, preview: 2.83 },
  cumulative_damage_received: { fixed: 0, preview: 10093, localeFormat: true },
  cumulative_deaths: { fixed: 0, preview: 2 },
  cumulative_dropped_capture_points: { fixed: 2, preview: 15 },
  cumulative_frags: { fixed: 0, preview: 26 },
  cumulative_hits: { fixed: 0, preview: 480 },
  cumulative_inaccuracy: {
    fixed: 0,
    unit: '%',
    coefficient: 100,
    preview: 0.08,
  },
  cumulative_kills_to_death_ratio: { fixed: 2, preview: 2.3 },
  cumulative_losses: { fixed: 0, preview: 3 },
  cumulative_misses: { fixed: 0, preview: 13 },
  cumulative_shots: { fixed: 0, preview: 309 },
  cumulative_spotted: { fixed: 0, preview: 99 },
  cumulative_survived_battles: { fixed: 0, preview: 10 },
  cumulative_win_and_survived: { fixed: 0, preview: 9 },
  cumulative_wins: { fixed: 0, preview: 8 },
  cumulative_xp: { fixed: 0, preview: 19403, localeFormat: true },
  cumulative_wn8: { fixed: 0, preview: 3103, localeFormat: true },
  cumulative_battle_life_time: {
    fixed: 0,
    preview: 109,
    coefficient: 1 / 60,
    localeFormat: true,
  },
};
