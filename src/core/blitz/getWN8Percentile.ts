import { Percentile } from '../../constants/percentiles';

export const WN8_PERCENTILES: [number, Percentile][] = [
  [0, Percentile.VeryBad],
  [300, Percentile.Bad],
  [450, Percentile.BelowAverage],
  [650, Percentile.Average],
  [900, Percentile.AboveAverage],
  [1200, Percentile.Good],
  [1600, Percentile.VeryGood],
  [2000, Percentile.Great],
  [2450, Percentile.Unicum],
  [2900, Percentile.SuperUnicum],
];

export default function getWN8Percentile(WN8: number) {
  const lastIndex = WN8_PERCENTILES.findLastIndex(
    ([WN8Listing]) => WN8Listing <= WN8,
  );
  return WN8_PERCENTILES[lastIndex === -1 ? 0 : lastIndex][1];
}
