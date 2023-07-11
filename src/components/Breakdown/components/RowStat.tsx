import { Percentile } from '../../../constants/percentiles';
import { theme } from '../../../stitches.config';
import PercentileIndicator from '../../PercentileIndicator';

export interface RowStatProps {
  name: string;
  value: string | number;
  delta?: number;
  percentile?: Percentile;
  minimized?: boolean;
}

export function RowStat({
  name,
  value,
  delta,
  percentile,
  minimized,
}: RowStatProps) {
  return (
    <div
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
            color: theme.colors.textHighContrast,
            fontSize: 16,
          }}
        >
          {value}
        </span>
      </div>

      {!minimized && (
        <span style={{ color: theme.colors.textLowContrast, fontSize: 12 }}>
          {name}
        </span>
      )}
    </div>
  );
}
