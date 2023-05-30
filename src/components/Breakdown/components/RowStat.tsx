import { theme } from '../../../stitches.config.js';

export interface RowStatProps {
  name: string;
  value: string;
  career: string;
  delta?: number;
}

export function RowStat({ name, value, career, delta }: RowStatProps) {
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
      <span style={{ color: theme.colors.textLowContrast, fontSize: 12 }}>
        {career}
      </span>

      <div
        style={{
          display: 'flex',
          gap: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {delta && (
          <img
            src={
              (delta ?? 0) > 0
                ? 'https://i.imgur.com/qbjiXa1.png'
                : 'https://i.imgur.com/3uyNhun.png'
            }
            style={{ width: 12, height: 12 }}
          />
        )}

        <span
          style={{
            color: theme.colors.textHighContrast,
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          {value}
        </span>
      </div>

      <span style={{ color: theme.colors.textLowContrast, fontSize: 12 }}>
        {name}
      </span>
    </div>
  );
}
