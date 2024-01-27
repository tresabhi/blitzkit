import { createColors } from 'bepaint';
import { Percentile } from '../../../constants/percentiles';
import {
  AccentColor,
  GrayColor,
  PALETTES,
} from '../../../constants/radixColors';
import { TREE_TYPE_ICONS, TankType, TreeType } from '../../Tanks';
import { RowStat } from './RowStat';

export interface RowStatItem {
  title: string;
  current?: number | string;
  career?: number | string;
  delta?: number;
  percentile?: Percentile;
}

interface RowProps {
  type?: 'tank' | 'summary';
  title: string;
  minimized?: boolean;
  treeType?: TreeType;
  tankType?: TankType;
  color?: AccentColor | GrayColor;
  stats: (RowStatItem | undefined)[];
}

export function Row({
  color = 'slate',
  stats,
  title,
  minimized,
  tankType,
  treeType,
  type,
}: RowProps) {
  const theme = createColors(PALETTES[`${color}Dark`]);

  return (
    <div
      className="session-tracker-row"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        backgroundColor: theme.appBackground2,
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
          backgroundColor: theme.componentInteractive,
        }}
      >
        {type === 'tank' && tankType !== undefined && (
          <img
            src={TREE_TYPE_ICONS[treeType ?? 'researchable'][tankType]}
            style={{ width: 16, height: 16 }}
          />
        )}

        <span
          style={{
            color:
              type === 'tank'
                ? treeType === 'collector'
                  ? theme.textLowContrast_blue
                  : treeType === 'premium'
                    ? theme.textLowContrast_amber
                    : theme.textHighContrast
                : theme.textLowContrast,
            fontWeight: 900,
            fontSize: 16,
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        {stats.map(
          (row, index) =>
            row && (
              <RowStat
                minimized={minimized}
                key={index}
                name={`${row.title} • ${row.career ?? '--'}`}
                value={row.current ?? '--'}
                delta={row.delta}
                percentile={row.percentile}
              />
            ),
        )}
      </div>
    </div>
  );
}
