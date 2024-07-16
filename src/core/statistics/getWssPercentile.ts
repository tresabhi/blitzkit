export enum WssPercentile {
  SuperMalum,
  Malum,
  VeryBad,
  Bad,
  BelowAverage,
  Average,
  AboveAverage,
  Good,
  VeryGood,
  Unicum,
  SuperUnicum,
}

export const WSS_PERCENTILES = [
  { min: -Infinity, percentile: WssPercentile.SuperMalum }, // 0%
  { min: -2.33, percentile: WssPercentile.Malum }, // 1%
  { min: -1.28, percentile: WssPercentile.VeryBad }, // 10%
  { min: -0.83, percentile: WssPercentile.Bad }, // 20%
  { min: -0.55, percentile: WssPercentile.BelowAverage }, // 30%
  { min: -0.23, percentile: WssPercentile.Average }, // 40%
  { min: 0.23, percentile: WssPercentile.AboveAverage }, // 60%
  { min: 0.53, percentile: WssPercentile.Good }, // 70%
  { min: 0.83, percentile: WssPercentile.VeryGood }, // 80%
  { min: 1.23, percentile: WssPercentile.Unicum }, // 90%
  { min: 2.35, percentile: WssPercentile.SuperUnicum }, // 99%
];

export const WSS_COLORS = {
  [WssPercentile.SuperMalum]: 'tomato',
  [WssPercentile.Malum]: 'orange',
  [WssPercentile.VeryBad]: 'amber',
  [WssPercentile.Bad]: 'yellow',
  [WssPercentile.BelowAverage]: 'lime',
  [WssPercentile.Average]: 'green',
  [WssPercentile.AboveAverage]: 'teal',
  [WssPercentile.Good]: 'cyan',
  [WssPercentile.VeryGood]: 'pink',
  [WssPercentile.Unicum]: 'plum',
  [WssPercentile.SuperUnicum]: 'purple',
} as const;

export default function getWssPercentile(wn8: number) {
  const lastIndex = WSS_PERCENTILES.findLastIndex(({ min }) => min <= wn8);
  return WSS_PERCENTILES[lastIndex === -1 ? 0 : lastIndex].percentile;
}
