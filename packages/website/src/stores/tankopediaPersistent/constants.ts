import type { TankopediaSortBy } from '.';

export const SORT_UNITS: Record<TankopediaSortBy, string | undefined> = {
  'meta.none': undefined,
  'survivability.health': 'hp',
  'fire.aimTime': 's',
  'fire.caliber': 'mm',
  'fire.damage': 'hp',
  'fire.moduleDamage': 'hp',
  'fire.dispersionMoving': 'm',
  'fire.dispersionStill': 'm',
  'fire.dpm': undefined,
  'fire.dpmPremium': undefined,
  'fire.gunDepression': '°',
  'fire.gunElevation': '°',
  'fire.premiumPenetration': 'mm',
  'fire.reload': 's',
  'fire.shellVelocity': 'm/s',
  'fire.shellRange': 'm',
  'fire.shellCapacity': undefined,
  'fire.standardPenetration': 'mm',
  'maneuverability.backwardsSpeed': 'kph',
  'maneuverability.forwardsSpeed': 'kph',
  'maneuverability.power': 'hp',
  'maneuverability.powerToWeight': 'hp/tn',
  'maneuverability.traverseSpeed': '°/s',
  'maneuverability.weight': 'tn',
  'survivability.camouflageMoving': '%',
  'survivability.camouflageShooting': '%',
  'survivability.camouflageStill': '%',
  'survivability.length': 'm',
  'survivability.viewRange': 'm',
  'survivability.volume': 'm^3',
};

export enum TankopediaDisplay {
  Model,
  DynamicArmor,
  StaticArmor,
  ShootingRange,
}
