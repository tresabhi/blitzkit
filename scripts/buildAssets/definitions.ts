import { readdir } from 'fs/promises';
import { parse } from 'path';
import { Vector3Tuple } from 'three';
import { TankType } from '../../src/components/Tanks';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import { toUniqueId } from '../../src/core/blitz/toUniqueId';
import commitMultipleFiles from '../../src/core/blitzkrieg/commitMultipleFiles';
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
import { DATA, DOI } from './constants';

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
  hull: {
    armor: VehicleDefinitionArmor;
    turretPositions: { turret: string };
    turretInitialRotation?: { yaw: 0; pitch: 6.5; roll: 0 };
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
          armor: VehicleDefinitionArmor;
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
const LANGUAGE = 'en';

export async function buildDefinitions() {
  console.log('Building tank definitions...');

  const tankDefinitions: TankDefinitions = {};
  const modelDefinitions: ModelDefinitions = {};
  const nations = await readdir(`${DATA}/${DOI.vehicleDefinitions}`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );
  const strings = await readYAMLDVPL<Strings>(
    `${DATA}/${DOI.strings}/${LANGUAGE}.yaml.dvpl`,
  );

  await Promise.all(
    nations.map(async (nation) => {
      const tankList = await readXMLDVPL<{ root: VehicleDefinitionList }>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/list.xml.dvpl`,
      );
      const turretList = await readXMLDVPL<{
        root: TurretDefinitionsList;
      }>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/components/turrets.xml.dvpl`,
      );
      const gunList = await readXMLDVPL<{
        root: GunDefinitionsList;
      }>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/components/guns.xml.dvpl`,
      );
      const shellList = await readXMLDVPL<{
        root: ShellDefinitionsList;
      }>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/components/shells.xml.dvpl`,
      );

      for (const tankKey in tankList.root) {
        const tank = tankList.root[tankKey];
        const tankPrice: TankDefinitionPrice =
          typeof tank.price === 'number'
            ? { type: 'credits', value: tank.price }
            : { type: 'gold', value: tank.price['#text'] };
        const tankDefinition = await readXMLDVPL<{ root: VehicleDefinitions }>(
          `${DATA}/${DOI.vehicleDefinitions}/${nation}/${tankKey}.xml.dvpl`,
        );
        const turretOrigin = tankDefinition.root.hull.turretPositions.turret
          .split(' ')
          .map(Number) as Vector3Tuple;
        const tankId = toUniqueId(nation, tank.id);
        const tankTags = tank.tags.split(' ');
        const hullArmor: ModelArmor = { thickness: {} };

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
          name:
            (tank.shortUserString
              ? strings[tank.shortUserString]
              : undefined) ??
            strings[tank.userString] ??
            tankKey.replaceAll('_', ' '),
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

        modelDefinitions[tankId] = {
          armor: hullArmor,
          turretOrigin,
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
              parse(turret.models.undamaged).name.split('_')[1],
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
              const gun = gunList.root.shared[gunKey];
              const pitchLimitsRaw =
                turretGunEntry.pitchLimits ?? gun.pitchLimits;
              const gunPitch = (
                typeof pitchLimitsRaw === 'string'
                  ? pitchLimitsRaw
                  : pitchLimitsRaw.at(-1)!
              )
                .split(' ')
                .map(Number) as [number, number];
              const gunModel = Number(
                parse(turretGunEntry.models.undamaged).name.split('_')[1],
              );
              const gunName =
                strings[gun.userString] ?? gunKey.replaceAll('_', ' ');
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
                tier: gun.level as Tier,
                shells: [],
                type: gunType,
                reload: gunReload,
                count: gunClipCount,
                interClip: gunInterClip,
              } as GunDefinition);

              modelDefinitions[tankId].turrets[turretId].guns[gunId] = {
                armor: gunArmor,
                model: gunModel,
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

              Object.keys(gun.shots).forEach((shellKey) => {
                const turretShellEntry = gun.shots[shellKey];
                const shell = shellList.root[shellKey];
                const shellId = toUniqueId(nation, shell.id);
                const shellName =
                  strings[shell.userString] ?? shellKey.replaceAll('_', ' ');

                tankDefinitions[tankId].turrets[turretIndex].guns[
                  gunIndex
                ].shells.push({
                  id: shellId,
                  name: shellName,
                  speed: turretShellEntry.speed,
                  damage: {
                    armor: shell.damage.armor,
                    devices: shell.damage.devices,
                  },
                  caliber: shell.caliber,
                  normalization: shell.normalizationAngle,
                  ricochet: shell.ricochetAngle,
                  type: blitzShellKindToBLitzkrieg[shell.kind],
                  icon: shell.icon,
                });
              });
            });
          },
        );
      }
    }),
  );

  console.log('Committing definitions...');
  await commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
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
    ],
    true,
  );
}
