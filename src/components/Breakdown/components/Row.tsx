import getWN8Percentile from '../../../core/blitz/getWN8Percentile';
import { theme } from '../../../stitches.config';
import { RowDiscriminator } from './RowDiscriminator';
import { RowStat } from './RowStat';

export interface RowProps {
  name: string;
  winrate: number;
  careerWinrate: number;
  WN8?: number;
  careerWN8?: number;
  damage: number;
  careerDamage: number;
  battles: number;
  careerBattles: number;
  icon?: string;
  minimized: boolean;
  isListing: boolean;
  naked?: boolean;
}

export function Row({
  isListing,
  minimized,
  name,
  winrate,
  careerWinrate,
  WN8,
  careerWN8,
  damage,
  careerDamage,
  battles,
  careerBattles,
  icon,
  naked,
}: RowProps) {
  return (
    <div
      style={{
        display: 'flex',
        borderRadius: 4,
        backgroundColor: isListing
          ? theme.colors.componentInteractive
          : theme.colors.appBackground2,
        padding: 8,
      }}
    >
      <RowDiscriminator minimized={minimized} name={name} icon={icon} />

      <RowStat
        minimized={minimized}
        name={`Winrate • ${(careerWinrate * 100).toFixed(2)}%`}
        value={`${(winrate * 100).toFixed(2)}%`}
        delta={winrate - careerWinrate}
      />
      <RowStat
        minimized={minimized}
        name={`WN8 • ${careerWN8 === undefined ? '--' : careerWN8.toFixed(0)}`}
        value={WN8 === undefined ? '--' : WN8.toFixed(0)}
        percentile={WN8 === undefined ? undefined : getWN8Percentile(WN8)}
      />
      <RowStat
        minimized={minimized}
        name={`Damage • ${careerDamage.toFixed(0)}`}
        value={damage.toFixed(0)}
        delta={damage - careerDamage}
      />
      <RowStat
        minimized={minimized}
        name={`Battles • ${careerBattles.toFixed(0)}`}
        value={battles.toFixed(0)}
      />
    </div>
  );
}
