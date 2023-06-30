import { Percentile } from '../../../../constants/percentiles.js';
import getWN8Percentile from '../../../../core/blitz/getWN8Percentile.js';
import { theme } from '../../../../stitches.config.js';
import { PERCENTILE_COLORS } from '../../../PercentileIndicator.js';
import { Glow, GlowSide } from './components/Glow.js';

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
      <Glow percentile={percentile} side={GlowSide.Top} />

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

      <Glow percentile={percentile} side={GlowSide.Bottom} />
    </div>
  );
}
