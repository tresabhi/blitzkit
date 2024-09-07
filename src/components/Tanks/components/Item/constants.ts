import { TankClass, TreeType } from '.';
import {
  TANK_ICONS,
  TANK_ICONS_COLLECTOR,
  TANK_ICONS_PREMIUM,
} from '../../../../core/blitzkit/tankDefinitions/constants';

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
export const TREE_TYPE_ICONS: Record<TreeType, Record<TankClass, string>> = {
  researchable: TANK_ICONS,
  premium: TANK_ICONS_PREMIUM,
  collector: TANK_ICONS_COLLECTOR,
};
