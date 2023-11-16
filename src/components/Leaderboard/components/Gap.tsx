import { theme } from '../../../stitches.config';

export interface GapProps {
  message: string;
}

export function Gap({ message: number }: GapProps) {
  return (
    <div
      style={{
        display: 'flex',
        padding: 8,
        backgroundColor: theme.colors.componentNonInteractive,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          color: theme.colors.textLowContrast,
          fontSize: 16,
        }}
      >
        {number.toLocaleString()}
      </span>
    </div>
  );
}
