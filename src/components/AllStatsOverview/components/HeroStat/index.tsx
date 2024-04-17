import { theme } from '../../../../stitches.config';
import { Glow } from './components/Glow';

export interface WN8DisplayProps {
  subtitle: string;
  color: string;
  value: string | number;
}

export function HeroStat({ color, subtitle, value }: WN8DisplayProps) {
  return (
    <div
      style={{
        width: 128 * 2, // idk why twice the width turns into the correct width
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Glow color={color} style={{ marginBottom: -16 }} />

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
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <span
            style={{
              display: 'block',
              fontWeight: 900,
              fontSize: 32,
              color: theme.colors.textHighContrast,
              lineHeight: '26px',
              letterSpacing: '-0.03em',
            }}
          >
            {value}
          </span>
          <span
            style={{
              display: 'block',
              fontSize: 16,
              lineHeight: '16px',
              color: theme.colors.textHighContrast,
            }}
          >
            {subtitle}
          </span>
        </div>
      </div>

      <Glow color={color} direction="reverse" style={{ marginTop: -16 }} />
    </div>
  );
}
