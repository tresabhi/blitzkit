export enum BkniPercentile {
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

export const BKNI_PERCENTILES = [
  { min: 0, percentile: BkniPercentile.SuperMalum },
  { min: 1, percentile: BkniPercentile.Malum },
  { min: 10, percentile: BkniPercentile.VeryBad },
  { min: 20, percentile: BkniPercentile.Bad },
  { min: 30, percentile: BkniPercentile.BelowAverage },
  { min: 40, percentile: BkniPercentile.Average },
  { min: 60, percentile: BkniPercentile.AboveAverage },
  { min: 70, percentile: BkniPercentile.Good },
  { min: 80, percentile: BkniPercentile.VeryGood },
  { min: 90, percentile: BkniPercentile.Unicum },
  { min: 99, percentile: BkniPercentile.SuperUnicum },
];

export const BKNI_COLORS = {
  [BkniPercentile.SuperMalum]: 'tomato',
  [BkniPercentile.Malum]: 'orange',
  [BkniPercentile.VeryBad]: 'amber',
  [BkniPercentile.Bad]: 'yellow',
  [BkniPercentile.BelowAverage]: 'lime',
  [BkniPercentile.Average]: 'green',
  [BkniPercentile.AboveAverage]: 'teal',
  [BkniPercentile.Good]: 'cyan',
  [BkniPercentile.VeryGood]: 'pink',
  [BkniPercentile.Unicum]: 'plum',
  [BkniPercentile.SuperUnicum]: 'purple',
} as const;

export default function getBkniPercentile(wn8: number) {
  const lastIndex = BKNI_PERCENTILES.findLastIndex(({ min }) => min <= wn8);
  return BKNI_PERCENTILES[lastIndex === -1 ? 0 : lastIndex].percentile;
}
