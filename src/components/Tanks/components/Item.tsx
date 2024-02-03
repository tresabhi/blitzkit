import {
  TANK_ICONS,
  TANK_ICONS_COLLECTOR,
  TANK_ICONS_PREMIUM,
} from '../../../core/blitzkrieg/tankDefinitions';
import { theme } from '../../../stitches.config';

export const TANK_TYPES = [
  'tankDestroyer',
  'light',
  'medium',
  'heavy',
] as const;

// TODO: remove hyphen for underscore
export const TREE_TYPES = ['researchable', 'premium', 'collector'] as const;

export type TankType = (typeof TANK_TYPES)[number];
export type TreeType = (typeof TREE_TYPES)[number];

export const TREE_TYPE_NAMES: Record<TreeType, string> = {
  researchable: 'Tech tree',
  premium: 'Premium',
  collector: 'Collector',
};

export const TREE_TYPE_IMAGES: Record<TreeType, string> = {
  researchable: 'https://i.imgur.com/pJxO2XY.png',
  premium: 'https://i.imgur.com/mZzSwOU.png',
  collector: 'https://i.imgur.com/7A0RsG5.png',
};

export interface ItemProps {
  image?: string;
  tankType?: TankType;
  name: string;
  treeType: TreeType;
}

const TREE_TYPE_COLOR = {
  researchable: '',
  premium: '_amber',
  collector: '_blue',
} as const;

export const TREE_TYPE_ICONS: Record<TreeType, Record<TankType, string>> = {
  researchable: TANK_ICONS,
  premium: TANK_ICONS_PREMIUM,
  collector: TANK_ICONS_COLLECTOR,
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

      {/* {image && (
        // TODO: remove hardcoded dimensions when satori fixes non-width unloadable images
        <img
          src={image}
          width={106}
          height={32}
          style={{ objectFit: 'cover' }}
        />
      )} */}
    </div>
  );
}
