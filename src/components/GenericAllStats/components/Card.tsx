import { Percentile } from '../../../constants/percentiles';
import { theme } from '../../../stitches.config';
import PercentileIndicator from '../../PercentileIndicator';

export interface CardItem {
  label: string;
  value: string | number | undefined;
  percentile?: Percentile;
}

export interface CardProps {
  items: CardItem[];
  title: string;
}

export function Card({ items, title }: CardProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        flex: 1,
        borderRadius: 4,
        backgroundColor: theme.colors.componentInteractive,
        padding: 8,
      }}
    >
      <span
        style={{
          color: theme.colors.textHighContrast,
          fontSize: 24,
        }}
      >
        {title}
      </span>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 16, color: theme.colors.textLowContrast }}>
              {item.label}
            </span>

            <div
              style={{
                flex: 1,
                height: 1,
                borderRadius: 0.5,
                backgroundColor: theme.colors.borderNonInteractive,
              }}
            />

            <div
              style={{
                display: 'flex',
                gap: 4,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.percentile !== undefined && (
                <PercentileIndicator percentile={item.percentile} />
              )}
              <span
                style={{
                  fontSize: 16,
                  color: theme.colors.textHighContrast,
                }}
              >
                {item.value === undefined || Number.isNaN(item.value)
                  ? '--'
                  : item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
