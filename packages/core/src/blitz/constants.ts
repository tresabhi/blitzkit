import { TankClass } from '../protos';
import { BlitzStats } from '../statistics';

export const TREE_TYPES = ['researchable', 'premium', 'collector'] as const;

export const TANK_CLASSES = [
  TankClass.LIGHT,
  TankClass.MEDIUM,
  TankClass.HEAVY,
  TankClass.TANK_DESTROYER,
] as const;

export const emptyAllStats: BlitzStats = {
  battles: 0,
  capture_points: 0,
  damage_dealt: 0,
  damage_received: 0,
  dropped_capture_points: 0,
  frags: 0,
  frags8p: 0,
  hits: 0,
  losses: 0,
  max_frags: 0,
  max_xp: 0,
  shots: 0,
  spotted: 0,
  survived_battles: 0,
  xp: 0,
  win_and_survived: 0,
  wins: 0,
};
