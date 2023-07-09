import {
  TANK_ICONS,
  TANK_ICONS_PREMIUM,
} from '../../../core/blitz/tankopedia.js';
import { theme, themeAmber } from '../../../stitches.config.js';

export interface ItemProps {
  image?: string;
  type?: string;
  name: string;
  isPremium?: boolean;
}

export function Item({ image, type, name, isPremium }: ItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        height: 32,
        paddingLeft: 8,
        paddingRight: 8,
        overflow: 'hidden',
        alignItems: 'center',
        borderRadius: 4,
        backgroundColor: isPremium
          ? themeAmber.colors.componentInteractive
          : theme.colors.componentInteractive,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 4,
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflow: 'hidden',
        }}
      >
        {type && (
          <img
            src={isPremium ? TANK_ICONS_PREMIUM[type] : TANK_ICONS[type]}
            style={{ width: 14, height: 14 }}
          />
        )}
        <span
          style={{
            fontSize: 16,
            whiteSpace: 'nowrap',
            color: isPremium
              ? themeAmber.colors.textLowContrast
              : theme.colors.textHighContrast,
          }}
        >
          {name}
        </span>
      </div>

      {image && <img src={image} style={{ flex: 1 }} />}
    </div>
  );
}
