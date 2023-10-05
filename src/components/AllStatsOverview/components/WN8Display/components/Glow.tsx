import { Percentile } from '../../../../../constants/percentiles';
import { PERCENTILE_COLORS } from '../../../../PercentileIndicator';

export enum GlowSide {
  Top,
  Bottom,
}

export interface GlowProps {
  percentile: Percentile;
  side: GlowSide;
}

export function Glow({ percentile, side }: GlowProps) {
  const color = PERCENTILE_COLORS[percentile];
  const color1 = color;
  const color2 = `${color}00`;

  const background = `linear-gradient(${
    side === GlowSide.Top ? 0 : 180
  }deg, ${color1} 0%, ${color2} 100%)`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: side === GlowSide.Top ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
      }}
    >
      <div style={{ height: 54, width: 16, background }} />
      <div style={{ height: 72, width: 16, background }} />
      <div style={{ height: 80, width: 16, background }} />
      <div style={{ height: 72, width: 16, background }} />
      <div style={{ height: 54, width: 16, background }} />
    </div>
  );
}
