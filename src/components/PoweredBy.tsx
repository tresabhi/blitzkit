import { ReactNode } from 'react';
import { theme } from '../stitches.config.js';

export enum PoweredByType {
  BlitzStars,
  Wargaming,
}

export interface PoweredByProps {
  type: PoweredByType;
  footer?: ReactNode;
}

const POWERED_BY_IMAGES: Record<PoweredByType, string> = {
  [PoweredByType.BlitzStars]:
    'https://www.blitzstars.com/assets/images/4b4cb591.TankyMcPewpew.png',
  [PoweredByType.Wargaming]: 'https://i.imgur.com/jADGWm0.png',
};

const POWERED_BY_NAMES: Record<PoweredByType, string> = {
  [PoweredByType.BlitzStars]: 'BlitzStars',
  [PoweredByType.Wargaming]: 'Wargaming',
};

export default function PoweredBy({ type, footer }: PoweredByProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex' }}>{footer}</div>

      <div style={{ display: 'flex', gap: 4 }}>
        <img src={POWERED_BY_IMAGES[type]} style={{ height: 16, width: 16 }} />
        <span style={{ color: theme.colors.textLowContrast, fontSize: 16 }}>
          Powered by {POWERED_BY_NAMES[type]}
        </span>
      </div>
    </div>
  );
}
