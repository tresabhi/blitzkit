/**
 * (10)   0 -  10: super malum
 * (10)  10 -  20: malum
 * (20)  20 -  40: very bad
 * (20)  40 -  60: bad
 * (20)  60 -  80: below average
 * (40)  80 - 120: average
 * (20) 120 - 140: above average
 * (20) 140 - 160: good
 * (20) 160 - 180: very good
 * (10) 180 - 190: unicum
 * (10) 190 - 200: super unicum
 */

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

const BKNI_PERCENTILES = [
  { min: 0, percentile: BkniPercentile.SuperMalum },
  { min: 10, percentile: BkniPercentile.Malum },
  { min: 20, percentile: BkniPercentile.VeryBad },
  { min: 40, percentile: BkniPercentile.Bad },
  { min: 60, percentile: BkniPercentile.BelowAverage },
  { min: 80, percentile: BkniPercentile.Average },
  { min: 120, percentile: BkniPercentile.AboveAverage },
  { min: 140, percentile: BkniPercentile.Good },
  { min: 160, percentile: BkniPercentile.VeryGood },
  { min: 180, percentile: BkniPercentile.Unicum },
  { min: 190, percentile: BkniPercentile.SuperUnicum },
];

export default function getBkniPercentile(wn8: number) {
  const lastIndex = BKNI_PERCENTILES.findLastIndex(({ min }) => min <= wn8);
  return BKNI_PERCENTILES[lastIndex === -1 ? 0 : lastIndex].percentile;
}
