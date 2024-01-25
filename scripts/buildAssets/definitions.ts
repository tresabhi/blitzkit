import { readdir } from 'fs/promises';
import { parse as parsePath } from 'path';
import { Vector3Tuple } from 'three';
import { parse as parseYaml } from 'yaml';
import { TankType } from '../../src/components/Tanks';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import { toUniqueId } from '../../src/core/blitz/toUniqueId';
import { commitAssets } from '../../src/core/blitzkrieg/commitAssets';
import {
  ConsumableDefinitionFilterCategory,
  ConsumableDefinitions,
} from '../../src/core/blitzkrieg/consumablesDefinitions';
import {
  EquipmentDefinitions,
  EquipmentPreset,
  EquipmentRow,
} from '../../src/core/blitzkrieg/equipmentDefinitions';
import {
  ModelArmor,
  ModelDefinitions,
} from '../../src/core/blitzkrieg/modelDefinitions';
import {
  GunDefinition,
  ShellType,
  TankDefinitionPrice,
  TankDefinitions,
  Tier,
} from '../../src/core/blitzkrieg/tankDefinitions';
import { DATA, POI } from './constants';

type BlitzTankType = 'AT-SPG' | 'lightTank' | 'mediumTank' | 'heavyTank';
interface Strings {
  [key: string]: string;
}
type ShellKind =
  | 'ARMOR_PIERCING'
  | 'ARMOR_PIERCING_CR'
  | 'HIGH_EXPLOSIVE'
  | 'HOLLOW_CHARGE';
type ShellDefinitionsList = Record<
  string,
  {
    id: number;
    userString: string;
    icon: string;
    kind: ShellKind;
    caliber: number;
    damage: { armor: number; devices: number };
    normalizationAngle: number;
    ricochetAngle: number;
    explosionRadius?: number;
  }
> & {
  icons: Record<string, string>;
};
type VehicleDefinitionArmor = Record<
  string,
  number | { vehicleDamageFactor: 0; '#text': number }
>;
interface VehicleDefinitions {
  invisibility: { moving: number; still: number; firePenalty: number };
  consumableSlots: number;
  optDevicePreset: string;
  hull: {
    armor: VehicleDefinitionArmor;
    turretPositions: { turret: string };
    turretInitialRotation?: { yaw: 0; pitch: 6.5; roll: 0 };
  };
  chassis: {
    [key: string]: {
      hullPosition: string;
      armor: {
        leftTrack:
          | number
          | {
              chanceToHitByProjectile: number;
              chanceToHitByExplosion: number;
              '#text': number;
            };
        rightTrack:
          | number
          | {
              chanceToHitByProjectile: number;
              chanceToHitByExplosion: number;
              '#text': number;
            };
      };
    };
  };
  turrets0: {
    [key: string]: {
      armor: VehicleDefinitionArmor;
      userString: number;
      level: number;
      yawLimits: string | string[];
      gunPosition: string | string[];
      models: { undamaged: string };
      guns: {
        [key: string]: {
          armor: VehicleDefinitionArmor & {
            gun?:
              | number
              | {
                  chanceToHitByProjectile: number;
                  chanceToHitByExplosion: number;
                  '#text': number;
                };
          };
          reloadTime: number;
          maxAmmo: number;
          extraPitchLimits?: {
            front?: string;
            back?: string;
            transition?: number | number[];
          };
          pitchLimits?: string | string[];
          pumpGunMode?: boolean;
          pumpGunReloadTimes?: string;
          clip?: { count: number; rate: number };
          models: { undamaged: string };
        };
      };
    };
  };
}
export interface VehicleDefinitionList {
  [key: string]: {
    id: number;
    userString: string;
    shortUserString?: string;
    description: string;
    price: number | { gold: ''; '#text': number };
    sellPrice?: { gold: ''; '#text': number };
    enrichmentPermanentCost: number;
    notInShop?: boolean;
    tags: string;
    level: number;
    combatRole?: Record<string, string>;
    configurationModes: string;
  };
}
interface TurretDefinitionsList {
  nextAvailableId: number;
  ids: Record<string, number>;
}
interface GunDefinitionsList {
  nextAvailableId: number;
  ids: Record<string, number>;
  shared: {
    [key: string]: {
      userString: string;
      tags: string;
      level: number;
      pitchLimits: string;
      burst?: { count: number; rate: number };
      clip?: { count: number; rate: number };
      shots: {
        [key: string]: {
          speed: number;
          piercingPower: string;
        };
      };
    };
  };
}

export interface OptionalDevices {
  [key: string]: {
    id: number;
    userString: string;
    description: string;
    icon: string;
    script: unknown;
    display_params: unknown;
  };
}

interface OptionalDeviceSlots {
  presets: {
    [key: string]: {
      level0: OptionalDeviceSlotRow;
      level1: OptionalDeviceSlotRow;
      level2: OptionalDeviceSlotRow;
    };
  };
}

interface OptionalDeviceSlotRow {
  [key: string]: { device0: string; device1: string };
}

export interface ConsumablesCommon {
  [key: string]: {
    id: number;
    userString: string;
    description: string;
    icon: string;
    category: string;
    tags: string;
    vehicleFilter: {
      include: { vehicle: ConsumablesFilter };
      exclude?: { vehicle: ConsumablesFilter };
    };
    script: {
      '#text': string;
      automatic?: boolean;
      duration?: number;
      cooldown?: number;
      shotEffect?: string;
      bonusValues?: { [key: string]: number };
    } & Record<string, string>;
  };
}

type ConsumablesFilter =
  | { minLevel: number; maxLevel: number }
  | { name: string }
  | { extendedTags: string };

const consumableEffectSuffixes = [
  'Increase',
  'Factor',
  'Bias',
  'Coef',
  'Percent',
];
const blitzTankTypeToBlitzkrieg: Record<BlitzTankType, TankType> = {
  'AT-SPG': 'tank_destroyer',
  lightTank: 'light',
  mediumTank: 'medium',
  heavyTank: 'heavy',
};
const blitzShellKindToBLitzkrieg: Record<ShellKind, ShellType> = {
  ARMOR_PIERCING: 'ap',
  ARMOR_PIERCING_CR: 'ap_cr',
  HIGH_EXPLOSIVE: 'he',
  HOLLOW_CHARGE: 'hc',
};
const missingStrings: Record<string, string> = {
  '#artefacts:tungstentip/name': 'Tungsten Shells',
};

export async function buildDefinitions(production: boolean) {
  console.log('Building tank definitions...');

  const tankDefinitions: TankDefinitions = {};
  const modelDefinitions: ModelDefinitions = {};
  const equipmentDefinitions: EquipmentDefinitions = {
    presets: {},
    equipments: {},
  };
  const consumableDefinitions: ConsumableDefinitions = {};
  const nations = await readdir(`${DATA}/${POI.vehicleDefinitions}`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );
  const tankStringIdMap: Record<string, number> = {};
  const strings = await readYAMLDVPL<Strings>(
    `${DATA}/${POI.strings}/en.yaml.dvpl`,
  );
  const stringsCache = await fetch(POI.cachedStrings)
    .then((response) => response.text())
    .then((string) => parseYaml(string) as Strings);
  const optionalDevices = await readXMLDVPL<{ root: OptionalDevices }>(
    `${DATA}/${POI.optionalDevices}.dvpl`,
  );
  const optionalDeviceSlots = await readXMLDVPL<{
    root: OptionalDeviceSlots;
  }>(`${DATA}/${POI.optionalDeviceSlots}.dvpl`);
  const consumables = await readXMLDVPL<{ root: ConsumablesCommon }>(
    `${DATA}/${POI.consumablesCommon}.dvpl`,
  );

  await Promise.all(
    nations.map(async (nation) => {
      const tankList = await readXMLDVPL<{ root: VehicleDefinitionList }>(
        `${DATA}/${POI.vehicleDefinitions}/${nation}/list.xml.dvpl`,
      );
      const turretList = await readXMLDVPL<{
        root: TurretDefinitionsList;
      }>(
        `${DATA}/${POI.vehicleDefinitions}/${nation}/components/turrets.xml.dvpl`,
      );
      const gunList = await readXMLDVPL<{
        root: GunDefinitionsList;
      }>(
        `${DATA}/${POI.vehicleDefinitions}/${nation}/components/guns.xml.dvpl`,
      );
      const shellList = await readXMLDVPL<{
        root: ShellDefinitionsList;
      }>(
        `${DATA}/${POI.vehicleDefinitions}/${nation}/components/shells.xml.dvpl`,
      );

      for (const tankKey in tankList.root) {
        const tank = tankList.root[tankKey];
        const tankPrice: TankDefinitionPrice =
          typeof tank.price === 'number'
            ? { type: 'credits', value: tank.price }
            : { type: 'gold', value: tank.price['#text'] };
        const tankDefinition = await readXMLDVPL<{ root: VehicleDefinitions }>(
          `${DATA}/${POI.vehicleDefinitions}/${nation}/${tankKey}.xml.dvpl`,
        );
        const defaultChassis = Object.values(tankDefinition.root.chassis).at(
          -1,
        )!;
        const turretOrigin = tankDefinition.root.hull.turretPositions.turret
          .split(' ')
          .map(Number) as Vector3Tuple;
        const hullOrigin = defaultChassis.hullPosition
          .split(' ')
          .map(Number) as Vector3Tuple;
        const tankId = toUniqueId(nation, tank.id);
        const tankTags = tank.tags.split(' ');
        const hullArmor: ModelArmor = { thickness: {} };
        const trackArmorRaw = defaultChassis.armor.leftTrack;
        const equipment = tankDefinition.root.optDevicePreset;
        tankStringIdMap[`${nation}:${tankKey}`] = tankId;

        Object.keys(tankDefinition.root.hull.armor)
          .filter((name) => name.startsWith('armor_'))
          .forEach((name) => {
            const armorIdString = name.match(/armor_(\d+)/)?.[1];

            if (armorIdString === undefined) {
              throw new SyntaxError(`Invalid armor id: ${name}`);
            }

            const armorId = parseInt(armorIdString);
            const armorRaw = tankDefinition.root.hull.armor[name];

            if (typeof armorRaw === 'number') {
              hullArmor.thickness[armorId] = armorRaw;
            } else {
              if (!hullArmor.spaced) hullArmor.spaced = [];
              hullArmor.thickness[armorId] = armorRaw['#text'];
              hullArmor.spaced.push(armorId);
            }
          });

        tankDefinitions[tankId] = {
          id: tankId,
          equipment,
          consumables: tankDefinition.root.consumableSlots,
          name:
            (tank.shortUserString
              ? strings[tank.shortUserString] ??
                stringsCache[tank.shortUserString]
              : undefined) ??
            strings[tank.userString] ??
            stringsCache[tank.userString],
          name_full: strings[tank.userString] ?? stringsCache[tank.userString],
          nation,
          tree_type: (tank.sellPrice ? 'gold' in tank.sellPrice : false)
            ? 'collector'
            : (typeof tank.price === 'number' ? false : 'gold' in tank.price)
              ? 'premium'
              : 'researchable',
          tier: tank.level as Tier,
          type: blitzTankTypeToBlitzkrieg[tankTags[0] as BlitzTankType],
          testing: tankTags.includes('testTank') ? true : undefined,
          price: tankPrice,
          camouflage: {
            still: tankDefinition.root.invisibility.still,
            moving: tankDefinition.root.invisibility.moving,
            firing: tankDefinition.root.invisibility.firePenalty,
          },
          turrets: [],
        };

        if (
          tankDefinitions[tankId].name === tankDefinitions[tankId].name_full
        ) {
          delete tankDefinitions[tankId].name_full;
        }

        modelDefinitions[tankId] = {
          armor: hullArmor,
          trackThickness:
            typeof trackArmorRaw === 'number'
              ? trackArmorRaw
              : trackArmorRaw['#text'],
          turretOrigin,
          hullOrigin,
          turretRotation: tankDefinition.root.hull.turretInitialRotation
            ? {
                yaw: tankDefinition.root.hull.turretInitialRotation.yaw,
                pitch: tankDefinition.root.hull.turretInitialRotation.pitch,
                roll: tankDefinition.root.hull.turretInitialRotation.roll,
              }
            : undefined,
          turrets: {},
        };

        Object.keys(tankDefinition.root.turrets0).forEach(
          (turretKey, turretIndex) => {
            const turret = tankDefinition.root.turrets0[turretKey];
            const turretModel = Number(
              parsePath(turret.models.undamaged).name.split('_')[1],
            );
            const turretId = toUniqueId(nation, turretList.root.ids[turretKey]);
            const turretYaw = (
              typeof turret.yawLimits === 'string'
                ? turret.yawLimits
                : turret.yawLimits.at(-1)!
            )
              .split(' ')
              .map(Number) as [number, number];
            const gunOrigin = (
              typeof turret.gunPosition === 'string'
                ? turret.gunPosition
                : turret.gunPosition[0]
            )
              .split(' ')
              .map(Number) as Vector3Tuple;
            const turretArmor: ModelArmor = { thickness: {} };

            Object.keys(turret.armor)
              .filter((name) => name.startsWith('armor_'))
              .forEach((name) => {
                const armorIdString = name.match(/armor_(\d+)/)?.[1];

                if (armorIdString === undefined) {
                  throw new SyntaxError(`Invalid armor id: ${name}`);
                }

                const armorId = parseInt(armorIdString);
                const armorRaw = turret.armor[name];

                if (typeof armorRaw === 'number') {
                  turretArmor.thickness[armorId] = armorRaw;
                } else {
                  if (!turretArmor.spaced) turretArmor.spaced = [];
                  turretArmor.thickness[armorId] = armorRaw['#text'];
                  turretArmor.spaced.push(armorId);
                }
              });

            tankDefinitions[tankId].turrets.push({
              id: turretId,
              name:
                strings[turret.userString] ??
                turretKey
                  .replaceAll('_', ' ')
                  .replace(/^(Turret ([0-9] )?)+/, ''),
              tier: turret.level as Tier,
              guns: [],
            });

            modelDefinitions[tankId].turrets[turretId] = {
              armor: turretArmor,
              gunOrigin,
              model: turretModel,
              yaw:
                -turretYaw[0] + turretYaw[1] === 360
                  ? undefined
                  : { min: turretYaw[0], max: turretYaw[1] },
              guns: {},
            };

            Object.keys(turret.guns).forEach((gunKey, gunIndex) => {
              const turretGunEntry = turret.guns[gunKey];
              const gunId = toUniqueId(nation, gunList.root.ids[gunKey]);
              const gunListEntry = gunList.root.shared[gunKey];
              const pitchLimitsRaw =
                turretGunEntry.pitchLimits ?? gunListEntry.pitchLimits;
              const gunPitch = (
                typeof pitchLimitsRaw === 'string'
                  ? pitchLimitsRaw
                  : pitchLimitsRaw.at(-1)!
              )
                .split(' ')
                .map(Number) as [number, number];
              const gunModel = Number(
                parsePath(turretGunEntry.models.undamaged).name.split('_')[1],
              );
              const gunName =
                strings[gunListEntry.userString] ?? gunKey.replaceAll('_', ' ');
              const gunType =
                'clip' in turretGunEntry
                  ? turretGunEntry.pumpGunMode
                    ? 'auto_reloader'
                    : 'auto_loader'
                  : 'regular';
              const gunReload =
                gunType === 'auto_reloader'
                  ? turretGunEntry.pumpGunReloadTimes!.split(' ').map(Number)
                  : turretGunEntry.reloadTime;
              const gunClipCount =
                gunType === 'regular' ? undefined : turretGunEntry.clip!.count;
              const gunInterClip =
                gunType === 'regular'
                  ? undefined
                  : 60 / turretGunEntry.clip!.rate;
              const front = turretGunEntry.extraPitchLimits?.front
                ? turretGunEntry.extraPitchLimits.front.split(' ').map(Number)
                : undefined;
              const back = turretGunEntry.extraPitchLimits?.back
                ? turretGunEntry.extraPitchLimits.back.split(' ').map(Number)
                : undefined;
              const transition = turretGunEntry.extraPitchLimits?.transition
                ? typeof turretGunEntry.extraPitchLimits.transition === 'number'
                  ? turretGunEntry.extraPitchLimits.transition
                  : turretGunEntry.extraPitchLimits.transition.at(-1)!
                : undefined;
              const gunArmor: ModelArmor = { thickness: {} };

              Object.keys(turretGunEntry.armor)
                .filter((name) => name.startsWith('armor_'))
                .forEach((name) => {
                  const armorIdString = name.match(/armor_(\d+)/)?.[1];
                  if (armorIdString === undefined) {
                    throw new SyntaxError(`Invalid armor id: ${name}`);
                  }
                  const armorId = parseInt(armorIdString);
                  const armorRaw = turretGunEntry.armor[name];
                  if (typeof armorRaw === 'number') {
                    gunArmor.thickness[armorId] = armorRaw;
                  } else {
                    if (!gunArmor.spaced) gunArmor.spaced = [];
                    gunArmor.thickness[armorId] = armorRaw['#text'];
                    gunArmor.spaced.push(armorId);
                  }
                });

              tankDefinitions[tankId].turrets[turretIndex].guns.push({
                id: gunId,
                name: gunName,
                tier: gunListEntry.level as Tier,
                shells: [],
                type: gunType,
                reload: gunReload,
                count: gunClipCount,
                interClip: gunInterClip,
              } as GunDefinition);

              modelDefinitions[tankId].turrets[turretId].guns[gunId] = {
                armor: gunArmor,
                model: gunModel,
                barrelThickness:
                  turretGunEntry.armor.gun === undefined
                    ? 0
                    : typeof turretGunEntry.armor.gun === 'number'
                      ? turretGunEntry.armor.gun
                      : turretGunEntry.armor.gun['#text'],
                pitch: {
                  min: gunPitch[0],
                  max: gunPitch[1],

                  front: front
                    ? {
                        min: front[0],
                        max: front[1],
                        range: front[2],
                      }
                    : undefined,
                  back: back
                    ? {
                        min: back[0],
                        max: back[1],
                        range: back[2],
                      }
                    : undefined,
                  transition,
                },
              };

              Object.keys(gunListEntry.shots).forEach((shellKey) => {
                const gunShellEntry = gunListEntry.shots[shellKey];
                const shell = shellList.root[shellKey];
                const shellId = toUniqueId(nation, shell.id);
                const shellName =
                  strings[shell.userString] ?? shellKey.replaceAll('_', ' ');
                const penetrationRaw = gunShellEntry.piercingPower
                  .split(' ')
                  .filter((penetrationString) => penetrationString !== '')
                  .map(Number);

                tankDefinitions[tankId].turrets[turretIndex].guns[
                  gunIndex
                ].shells.push({
                  id: shellId,
                  name: shellName,
                  speed: gunShellEntry.speed,
                  damage: {
                    armor: shell.damage.armor,
                    devices: shell.damage.devices,
                  },
                  caliber: shell.caliber,
                  normalization: shell.normalizationAngle,
                  ricochet: shell.ricochetAngle,
                  type: blitzShellKindToBLitzkrieg[shell.kind],
                  explosionRadius:
                    shell.kind === 'HIGH_EXPLOSIVE'
                      ? shell.explosionRadius ?? 0
                      : undefined,
                  icon: shell.icon,
                  penetration:
                    penetrationRaw[0] === penetrationRaw[1]
                      ? penetrationRaw[0]
                      : [penetrationRaw[0], penetrationRaw[1]],
                });
              });
            });
          },
        );
      }
    }),
  );

  Object.entries(optionalDevices.root).forEach(
    ([optionalDeviceKey, optionalDeviceEntry]) => {
      if (optionalDeviceKey === 'nextAvailableId') return;

      equipmentDefinitions.equipments[optionalDeviceEntry.id] = {
        name: strings[optionalDeviceEntry.userString],
      };
    },
  );

  Object.entries(optionalDeviceSlots.root.presets).forEach(
    ([optionalDeviceSlotKey, optionalDeviceSlotEntry]) => {
      if (optionalDeviceSlotKey === 'emptyPreset') return;

      equipmentDefinitions.presets[optionalDeviceSlotKey] = Object.values(
        optionalDeviceSlotEntry,
      ).map(
        (level) =>
          Object.values(level).map((options) => {
            return [
              optionalDevices.root[options.device0].id,
              optionalDevices.root[options.device1].id,
            ];
          }) as EquipmentRow,
      ) as EquipmentPreset;
    },
  );

  Object.values(consumables.root).forEach((consumable) => {
    consumableDefinitions[consumable.id] = {
      id: consumable.id,
      name:
        strings[consumable.userString] ??
        missingStrings[consumable.userString] ??
        `Unknown ${consumable.id}`,
      include: [],
    };

    const includeRaw = consumable.vehicleFilter.include.vehicle;
    const excludeRaw = consumable.vehicleFilter.exclude?.vehicle;

    if ('minLevel' in includeRaw) {
      consumableDefinitions[consumable.id].include.push({
        type: 'tier',
        min: includeRaw.minLevel,
        max: includeRaw.maxLevel,
      });
    } else if ('name' in includeRaw) {
      consumableDefinitions[consumable.id].include.push({
        type: 'ids',
        ids: includeRaw.name.split(' ').map((key) => tankStringIdMap[key]),
      });
    } else throw new SyntaxError('Unhandled include type');

    if (excludeRaw) {
      consumableDefinitions[consumable.id].exclude = [];

      if ('name' in excludeRaw) {
        consumableDefinitions[consumable.id].exclude!.push({
          type: 'ids',
          ids: excludeRaw.name.split(' ').map((key) => tankStringIdMap[key]),
        });
      } else if ('extendedTags' in excludeRaw) {
        consumableDefinitions[consumable.id].exclude!.push({
          type: 'category',
          categories: excludeRaw.extendedTags.split(
            ' ',
          ) as ConsumableDefinitionFilterCategory[],
        });
      } else throw new SyntaxError('Unhandled exclude type');
    }

    Object.entries({
      ...consumable.script,
      ...consumable.script.bonusValues,
    }).forEach(([effectName, effect]) => {
      if (
        !consumableEffectSuffixes.some((suffix) => effectName.endsWith(suffix))
      ) {
        return;
      }

      if (!consumableDefinitions[consumable.id].effects) {
        consumableDefinitions[consumable.id].effects = {};
      }

      consumableDefinitions[consumable.id].effects![effectName] =
        effect as number;
    });
  });

  await commitAssets(
    'definitions',
    [
      {
        content: JSON.stringify(tankDefinitions),
        encoding: 'utf-8',
        path: 'definitions/tanks.json',
      },
      {
        content: JSON.stringify(modelDefinitions),
        encoding: 'utf-8',
        path: 'definitions/models.json',
      },
      {
        content: JSON.stringify(equipmentDefinitions),
        encoding: 'utf-8',
        path: 'definitions/equipment.json',
      },
      {
        content: JSON.stringify(consumableDefinitions),
        encoding: 'utf-8',
        path: 'definitions/consumables.json',
      },
    ],
    production,
  );
}
