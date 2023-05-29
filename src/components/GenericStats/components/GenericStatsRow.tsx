import { theme } from '../../../stitches.config.js';
import { Stat } from '../index.js';

export interface GenericStatsRowProps {
  stat: Stat;
}

export default function GenericStatsRow({ stat }: GenericStatsRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span style={{ color: theme.colors.textLowContrast, fontSize: 16 }}>
        {stat[0]}
      </span>
      <span style={{ color: theme.colors.textHighContrast, fontWeight: 'bold', fontSize: 16 }}>
        {stat[1]}
      </span>
    </div>
  );
}
