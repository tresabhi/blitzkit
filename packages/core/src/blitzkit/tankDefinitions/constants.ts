import { CrewMember, GunDefinition, ShellType, TankClass, Tier } from '.';

export const SHELL_NAMES: Record<ShellType, string> = {
  ap: 'AP',
  ap_cr: 'APCR',
  hc: 'HEAT',
  he: 'HE',
};
export const CREW_MEMBER_NAMES: Record<CrewMember, string> = {
  commander: 'Commander',
  radioman: 'Radioman',
  gunner: 'Gunner',
  driver: 'Driver',
  loader: 'Loader',
};
export const GUN_TYPE_NAMES: Record<GunDefinition['type'], string> = {
  regular: 'Regular',
  autoLoader: 'Auto loader',
  autoReloader: 'Auto reloader',
};
/**
 * @deprecated use svg
 */
export const TANK_ICONS: Record<TankClass, string> = {
  'AT-SPG': 'https://i.imgur.com/BIHSEH0.png',
  lightTank: 'https://i.imgur.com/CSNha5V.png',
  mediumTank: 'https://i.imgur.com/wvf3ltm.png',
  heavyTank: 'https://i.imgur.com/ECeqlZa.png',
};
/**
 * @deprecated use svg
 */
export const TANK_ICONS_PREMIUM: Record<TankClass, string> = {
  'AT-SPG': 'https://i.imgur.com/TCu3EdR.png',
  lightTank: 'https://i.imgur.com/zdkpTRb.png',
  mediumTank: 'https://i.imgur.com/3z7eHX6.png',
  heavyTank: 'https://i.imgur.com/P3vbmyA.png',
};
/**
 * @deprecated use svg
 */
export const TANK_ICONS_COLLECTOR: Record<TankClass, string> = {
  'AT-SPG': 'https://i.imgur.com/WTjeirB.png',
  lightTank: 'https://i.imgur.com/EwhtKkU.png',
  mediumTank: 'https://i.imgur.com/u8YDMBh.png',
  heavyTank: 'https://i.imgur.com/8xRf3nc.png',
};
export const TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const TIER_ROMAN_NUMERALS: Record<Tier, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
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
