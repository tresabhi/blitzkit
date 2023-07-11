import { theme } from '../../../stitches.config';

export enum WN8SurroundingStatAlign {
  Left,
  Right,
}

export interface WN8SurroundingStatProps {
  label: string;
  value: string | number;
  align?: WN8SurroundingStatAlign;
  padded?: boolean;
}

export function WN8SurroundingStat({
  label,
  value,
  align = WN8SurroundingStatAlign.Left,
  padded = false,
}: WN8SurroundingStatProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems:
          align === WN8SurroundingStatAlign.Left ? 'flex-start' : 'flex-end',
        paddingLeft: padded && align === WN8SurroundingStatAlign.Left ? 32 : 0,
        paddingRight:
          padded && align === WN8SurroundingStatAlign.Right ? 32 : 0,
      }}
    >
      <span
        style={{
          color: theme.colors.textHighContrast,
          fontSize: 24,
          fontWeight: 'bold',
        }}
      >
        {value}
      </span>
      <span style={{ color: theme.colors.textLowContrast, fontSize: 16 }}>
        {label}
      </span>
    </div>
  );
}
