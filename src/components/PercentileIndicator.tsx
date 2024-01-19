import {
  amber,
  blue,
  green,
  lime,
  orange,
  pink,
  purple,
  red,
  slate,
  teal,
} from '@radix-ui/colors';
import { Percentile } from '../constants/percentiles';

export interface PercentileIndicatorProps {
  percentile: Percentile;
}

export const PERCENTILE_COLORS = {
  [Percentile.VeryBad]: slate.slate9,
  [Percentile.Bad]: red.red9,
  [Percentile.BelowAverage]: orange.orange9,
  [Percentile.Average]: amber.amber10,
  [Percentile.AboveAverage]: lime.lime8,
  [Percentile.Good]: green.green9,
  [Percentile.VeryGood]: teal.teal9,
  [Percentile.Great]: blue.blue9,
  [Percentile.Unicum]: pink.pink9,
  [Percentile.SuperUnicum]: purple.purple9,
};

export default function PercentileIndicator({
  percentile,
}: PercentileIndicatorProps) {
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: PERCENTILE_COLORS[percentile],
      }}
    />
  );
}
