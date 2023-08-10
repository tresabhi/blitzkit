import getWN8Percentile from '../../../core/blitz/getWN8Percentile';
import { TankType } from '../../../core/blitz/tankopedia';
import { theme } from '../../../stitches.config';
import { TREE_TYPE_ICONS, TreeTypeEnum } from '../../Tanks';
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
  minimized: boolean;
  isTank: boolean;
  treeType?: TreeTypeEnum;
  tankType?: TankType;
}

export function Row({
  isTank,
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
  treeType,
  tankType,
}: RowProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        backgroundColor: theme.colors.appBackground2,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
          gap: 4,
          backgroundColor: theme.colors.componentInteractive,
        }}
      >
        {isTank && treeType !== undefined && tankType !== undefined && (
          <img
            src={TREE_TYPE_ICONS[treeType][tankType]}
            style={{ width: 16, height: 16 }}
          />
        )}
        <span
          style={{
            color: isTank
              ? treeType === TreeTypeEnum.Collector
                ? theme.colors.textLowContrast_blue
                : treeType === TreeTypeEnum.Premium
                ? theme.colors.textLowContrast_amber
                : theme.colors.textHighContrast
              : theme.colors.textLowContrast,
            fontWeight: 900,
            fontSize: 16,
          }}
        >
          {name}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        <RowStat
          minimized={minimized}
          name={`Battles • ${careerBattles.toFixed(0)}`}
          value={battles.toFixed(0)}
        />
        <RowStat
          minimized={minimized}
          name={`Winrate • ${(careerWinrate * 100).toFixed(2)}%`}
          value={`${(winrate * 100).toFixed(2)}%`}
          delta={winrate - careerWinrate}
        />
        <RowStat
          minimized={minimized}
          name={`WN8 • ${
            careerWN8 === undefined ? '--' : careerWN8.toFixed(0)
          }`}
          value={WN8 === undefined ? '--' : WN8.toFixed(0)}
          percentile={WN8 === undefined ? undefined : getWN8Percentile(WN8)}
        />
        <RowStat
          minimized={minimized}
          name={`Damage • ${careerDamage.toFixed(0)}`}
          value={damage.toFixed(0)}
          delta={damage - careerDamage}
        />
      </div>
    </div>
  );
}
