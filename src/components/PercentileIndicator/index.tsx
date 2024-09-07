import { Percentile } from '@blitzkit/core/src/statistics/percentiles';
import { PERCENTILE_COLORS } from './constants';

interface PercentileIndicatorProps {
  percentile: Percentile;
}

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
