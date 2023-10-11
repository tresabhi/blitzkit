import {
  TANK_ICONS,
  TANK_ICONS_COLLECTOR,
  TANK_ICONS_PREMIUM,
} from '../../../core/blitz/tankopedia';
import { theme } from '../../../stitches.config';

export enum TreeTypeEnum {
  TechTree,
  Premium,
  Collector,
}

export type TreeTypeString = 'tech-tree' | 'premium' | 'collector';

export const TREE_TYPE_NAMES: Record<TreeTypeString, string> = {
  'tech-tree': 'Tech tree',
  premium: 'Premium',
  collector: 'Collector',
};

export interface ItemProps {
  image?: string;
  tankType?: string;
  name: string;
  treeType: TreeTypeEnum;
}

const TREE_TYPE_COLOR = {
  [TreeTypeEnum.TechTree]: '',
  [TreeTypeEnum.Premium]: '_amber',
  [TreeTypeEnum.Collector]: '_blue',
} as const;

export const TREE_TYPE_ICONS = {
  [TreeTypeEnum.TechTree]: TANK_ICONS,
  [TreeTypeEnum.Premium]: TANK_ICONS_PREMIUM,
  [TreeTypeEnum.Collector]: TANK_ICONS_COLLECTOR,
};

export function Item({ image, tankType, name, treeType }: ItemProps) {
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
        backgroundColor:
          theme.colors[`componentInteractive${TREE_TYPE_COLOR[treeType]}`],
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
        {tankType && (
          <img
            src={TREE_TYPE_ICONS[treeType][tankType]}
            style={{ width: 14, height: 14 }}
          />
        )}
        <span
          style={{
            fontSize: 16,
            whiteSpace: 'nowrap',
            color: theme.colors[`textLowContrast${TREE_TYPE_COLOR[treeType]}`],
          }}
        >
          {name}
        </span>
      </div>

      {image && <img src={image} style={{ flex: 1 }} />}
    </div>
  );
}
