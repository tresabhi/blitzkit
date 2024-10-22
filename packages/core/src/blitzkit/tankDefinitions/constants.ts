import {
  CrewType,
  GunDefinition,
  ShellType,
  TankClass,
  TankType,
  Tier,
} from '../../protos';

export const SHELL_NAMES: Record<ShellType, string> = {
  [ShellType.AP]: 'AP',
  [ShellType.APCR]: 'APCR',
  [ShellType.HEAT]: 'HEAT',
  [ShellType.HE]: 'HE',
};
export const CREW_MEMBER_NAMES: Record<CrewType, string> = {
  [CrewType.COMMANDER]: 'Commander',
  [CrewType.DRIVER]: 'Driver',
  [CrewType.GUNNER]: 'Gunner',
  [CrewType.LOADER]: 'Loader',
  [CrewType.RADIOMAN]: 'Radioman',
};
export const GUN_TYPE_NAMES: Record<
  Exclude<GunDefinition['gun_type'], undefined>['$case'],
  string
> = {
  auto_loader: 'Auto loader',
  auto_reloader: 'Auto reloader',
  regular: 'Regular',
};
/**
 * @deprecated use svg
 */
export const TANK_ICONS: Record<TankClass, string> = {
  [TankClass.TANK_DESTROYER]: 'https://i.imgur.com/BIHSEH0.png',
  [TankClass.LIGHT]: 'https://i.imgur.com/CSNha5V.png',
  [TankClass.MEDIUM]: 'https://i.imgur.com/wvf3ltm.png',
  [TankClass.HEAVY]: 'https://i.imgur.com/ECeqlZa.png',
};
/**
 * @deprecated use svg
 */
export const TANK_ICONS_PREMIUM: Record<TankClass, string> = {
  [TankClass.TANK_DESTROYER]: 'https://i.imgur.com/TCu3EdR.png',
  [TankClass.LIGHT]: 'https://i.imgur.com/zdkpTRb.png',
  [TankClass.MEDIUM]: 'https://i.imgur.com/3z7eHX6.png',
  [TankClass.HEAVY]: 'https://i.imgur.com/P3vbmyA.png',
};
/**
 * @deprecated use svg
 */
export const TANK_ICONS_COLLECTOR: Record<TankClass, string> = {
  [TankClass.TANK_DESTROYER]: 'https://i.imgur.com/WTjeirB.png',
  [TankClass.LIGHT]: 'https://i.imgur.com/EwhtKkU.png',
  [TankClass.MEDIUM]: 'https://i.imgur.com/u8YDMBh.png',
  [TankClass.HEAVY]: 'https://i.imgur.com/8xRf3nc.png',
};
export const TIERS = [
  Tier.I,
  Tier.II,
  Tier.III,
  Tier.IV,
  Tier.V,
  Tier.VI,
  Tier.VII,
  Tier.VIII,
  Tier.IX,
  Tier.X,
];
export const TIER_ROMAN_NUMERALS: Record<Tier, string> = {
  [Tier.I]: 'I',
  [Tier.II]: 'II',
  [Tier.III]: 'III',
  [Tier.IV]: 'IV',
  [Tier.V]: 'V',
  [Tier.VI]: 'VI',
  [Tier.VII]: 'VII',
  [Tier.VIII]: 'VIII',
  [Tier.IX]: 'IX',
  [Tier.X]: 'X',
};

export const flags: Record<string, string> = {
  ussr: '<:ussr:1218421042033197197>',
  germany: '🇩🇪',
  usa: '🇺🇸',
  china: '🇨🇳',
  uk: '🇬🇧',
  france: '🇫🇷',
  japan: '🇯🇵',
  european: '🇪🇺',
  other: '<:other:1218421572243558482>',
};
export const TREE_TYPE_ICONS: Record<TankType, Record<TankClass, string>> = {
  [TankType.RESEARCHABLE]: TANK_ICONS,
  [TankType.PREMIUM]: TANK_ICONS_PREMIUM,
  [TankType.COLLECTOR]: TANK_ICONS_COLLECTOR,
};
