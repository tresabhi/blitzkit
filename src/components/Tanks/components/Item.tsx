import { TANK_ICONS, TankType } from '../../../core/blitz/tankopedia.js';

export interface ItemProps {
  icon?: string;
  type?: TankType;
  name: string;
}

export function Item({ icon, type, name }: ItemProps) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 128,
        height: 128,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {icon && <img src={icon} style={{ flex: 1, objectFit: 'contain' }} />}

      <div style={{ display: 'flex', margin: 'auto', gap: 4 }}>
        {type && (
          <img src={TANK_ICONS[type]} style={{ width: 14, height: 14 }} />
        )}

        <span
          style={{ fontSize: 16, textAlign: 'center', whiteSpace: 'nowrap' }}
        >
          {name}
        </span>
      </div>
    </div>
  );
}
