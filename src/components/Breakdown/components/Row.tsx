import getWN8Percentile from '../../../core/blitz/getWN8Percentile.js';
import { RowDiscriminator } from './RowDiscriminator.js';
import { RowStat } from './RowStat.js';

export interface RowProps {
  name: string;
  winrate: number;
  careerWinrate: number;
  WN8: number;
  careerWN8: number;
  damage: number;
  careerDamage: number;
  survival: number;
  careerSurvival: number;
  battles: number;
  careerBattles: number;
  icon?: string;
}

export function Row({
  name,
  winrate,
  careerWinrate,
  WN8,
  careerWN8,
  damage,
  careerDamage,
  survival,
  careerSurvival,
  battles,
  careerBattles,
  icon,
}: RowProps) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <RowDiscriminator name={name} icon={icon} />
      <RowStat
        name="Winrate"
        value={`${(winrate * 100).toFixed(2)}%`}
        career={`${(careerWinrate * 100).toFixed(2)}%`}
        delta={winrate - careerWinrate}
      />
      <RowStat
        name="WN8"
        value={WN8.toFixed(0)}
        career={careerWN8.toFixed(0)}
        percentile={getWN8Percentile(WN8)}
      />
      <RowStat
        name="Damage"
        value={damage.toFixed(2)}
        career={careerDamage.toFixed(2)}
        delta={damage - careerDamage}
      />
      <RowStat
        name="Survival"
        value={`${(survival * 100).toFixed(2)}%`}
        career={`${(careerSurvival * 100).toFixed(2)}%`}
        delta={survival - careerSurvival}
      />
      <RowStat
        name="Battles"
        value={battles.toFixed(0)}
        career={careerBattles.toFixed(0)}
      />
    </div>
  );
}
