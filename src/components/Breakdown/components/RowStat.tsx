import { createColors } from 'bepaint';
import { Percentile } from '../../../constants/percentiles';
import {
  AccentColor,
  GrayColor,
  PALETTES,
} from '../../../constants/radixColors';
import PercentileIndicator from '../../PercentileIndicator';

interface RowStatProps {
  name: string;
  value?: string | number;
  delta?: number;
  percentile?: Percentile;
  minimized?: boolean;
  color?: AccentColor | GrayColor;
}

export function RowStat({
  name,
  value,
  delta,
  percentile,
  minimized = false,
  color = 'slate',
}: RowStatProps) {
  const theme = createColors(PALETTES[`${color}Dark`]);

  return (
    <div
      className="session-tracker-row-stat"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {percentile === undefined && delta !== undefined && delta !== 0 && (
          <img
            src={
              (delta ?? 0) > 0
                ? 'https://i.imgur.com/qbjiXa1.png'
                : 'https://i.imgur.com/3uyNhun.png'
            }
            style={{ width: 12, height: 12 }}
          />
        )}
        {percentile !== undefined && (
          <PercentileIndicator percentile={percentile} />
        )}

        <span
          style={{
            color: theme.textHighContrast,
            fontWeight: 700,
            fontSize: 16,
            textAlign: 'center',
          }}
        >
          {value}
        </span>
      </div>

      {!minimized && (
        <span
          style={{
            color: theme.textLowContrast,
            textAlign: 'center',
            fontSize: 12,
          }}
        >
          {name}
        </span>
      )}
    </div>
  );
}
