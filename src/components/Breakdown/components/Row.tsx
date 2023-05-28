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
  damage: averageDamage,
  careerDamage: careerAverageDamage,
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
        name="Damage"
        value={averageDamage.toFixed(2)}
        career={careerAverageDamage.toFixed(2)}
        delta={averageDamage - careerAverageDamage}
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
