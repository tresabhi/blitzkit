import { Percentile } from '../../../constants/percentiles';
import { TankType } from '../../../core/blitz/tankopedia';
import { theme } from '../../../stitches.config';
import { TREE_TYPE_ICONS, TreeTypeEnum } from '../../Tanks';
import { RowStat } from './RowStat';

interface RowProps {
  type: 'tank' | 'summary';
  title: string;
  minimized?: boolean;
  treeType?: TreeTypeEnum;
  tankType?: TankType;

  rows: {
    title: string;
    current?: number | string;
    career?: number | string;
    delta?: number;
    percentile?: Percentile;
  }[];
}

export function Row(props: RowProps) {
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
        {props.type === 'tank' &&
          props.treeType !== undefined &&
          props.tankType !== undefined && (
            <img
              src={TREE_TYPE_ICONS[props.treeType][props.tankType]}
              style={{ width: 16, height: 16 }}
            />
          )}

        <span
          style={{
            color:
              props.type === 'tank'
                ? props.treeType === TreeTypeEnum.Collector
                  ? theme.colors.textLowContrast_blue
                  : props.treeType === TreeTypeEnum.Premium
                  ? theme.colors.textLowContrast_amber
                  : theme.colors.textHighContrast
                : theme.colors.textLowContrast,
            fontWeight: 900,
            fontSize: 16,
          }}
        >
          {props.title}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        {props.rows.map((row, index) => (
          <RowStat
            minimized={props.minimized}
            key={index}
            name={`${row.title} • ${row.career ?? '--'}`}
            value={row.current ?? '--'}
            delta={row.delta}
            percentile={row.percentile}
          />
        ))}
      </div>
    </div>
  );
}
