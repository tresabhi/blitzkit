import { Percentile } from '../../../../constants/percentiles';
import getWN8Percentile from '../../../../core/statistics/getWN8Percentile';
import { theme } from '../../../../stitches.config';
import { PERCENTILE_COLORS } from '../../../PercentileIndicator';
import { Glow } from './components/Glow';

export interface WN8DisplayProps {
  WN8?: number;
}

export const PERCENTILE_NAMES = {
  [Percentile.VeryBad]: 'Very Bad',
  [Percentile.Bad]: 'Bad',
  [Percentile.BelowAverage]: 'Below Average',
  [Percentile.Average]: 'Average',
  [Percentile.AboveAverage]: 'Above Average',
  [Percentile.Good]: 'Good',
  [Percentile.VeryGood]: 'Very Good',
  [Percentile.Great]: 'Great',
  [Percentile.Unicum]: 'Unicum',
  [Percentile.SuperUnicum]: 'Super Unicum',
};

export function WN8Display({ WN8 }: WN8DisplayProps) {
  const percentile =
    WN8 === undefined ? Percentile.VeryBad : getWN8Percentile(WN8);
  const color = PERCENTILE_COLORS[percentile];

  return (
    <div
      style={{
        width: 128 * 2, // idk why twice the width turns into the correct width
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: -16,
      }}
    >
      <Glow color={PERCENTILE_COLORS[percentile]} />

      <div
        style={{
          width: 128,
          height: 80,
          backgroundColor: color,
          borderRadius: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: -4,
        }}
      >
        <span
          style={{
            fontWeight: 900,
            fontSize: 32,
            color: theme.colors.textHighContrast,
          }}
        >
          {WN8 === undefined ? '--' : WN8.toFixed(0)}
        </span>
        <span
          style={{
            fontSize: 16,
            color: theme.colors.textHighContrast,
          }}
        >
          {PERCENTILE_NAMES[percentile]}
        </span>
      </div>

      <Glow color={PERCENTILE_COLORS[percentile]} direction="reverse" />
    </div>
  );
}
