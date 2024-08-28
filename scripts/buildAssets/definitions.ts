import { readdir } from 'fs/promises';
import { parse as parsePath } from 'path';
import { Vector3Tuple } from 'three';
import { parse as parseYaml } from 'yaml';
import { TankClass } from '../../src/components/Tanks';
import { WARGAMING_APPLICATION_ID } from '../../src/constants/wargamingApplicationID';
import { readStringDVPL } from '../../src/core/blitz/readStringDVPL';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import { toUniqueId } from '../../src/core/blitz/toUniqueId';
import { CamouflageDefinitions } from '../../src/core/blitzkit/camouflageDefinitions';
import { commitAssets } from '../../src/core/blitzkit/commitAssets';
import {
  ConsumableDefinitions,
  ConsumableEntry,
  TankFilterDefinitionCategory,
} from '../../src/core/blitzkit/consumableDefinitions';
import {
  EquipmentDefinitions,
  EquipmentPreset,
  EquipmentRow,
} from '../../src/core/blitzkit/equipmentDefinitions';
import { GameDefinitions } from '../../src/core/blitzkit/gameDefinitions';
import { MapDefinitions } from '../../src/core/blitzkit/mapDefinitions';
import {
  ModelArmor,
  ModelDefinitions,
} from '../../src/core/blitzkit/modelDefinitions';
import {
  ProvisionDefinitions,
  ProvisionEntry,
} from '../../src/core/blitzkit/provisionDefinitions';
import { SkillDefinitions } from '../../src/core/blitzkit/skillDefinitions';
import { superCompress } from '../../src/core/blitzkit/superCompress';
import {
  Crew,
  CrewMember,
  GunDefinition,
  ShellType,
  TankDefinitions,
  TankPrice,
  Tier,
  Unlock,
} from '../../src/core/blitzkit/tankDefinitions';
import { DATA } from './constants';
import { Avatar } from './skillIcons';
import { TankParameters } from './tankIcons';

export interface BlitzStrings {
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
interface EngineDefinitionsList {
  nextAvailableId: number;
  ids: Record<string, number>;
  shared: {
    [key: string]: {
      userString: string;
      level: number;
      fireStartingChance: number;
      weight: number;
      power: number;
    };
  };
}
export interface ChassisDefinitionsList {
  nextAvailableId: number;
  ids: Record<string, number>;
}
type VehicleDefinitionArmor = Record<
  string,
  number | { vehicleDamageFactor: 0; '#text': number }
>;
interface UnlocksInner {
  cost: number | string;
  '#text': number;
}
type Unlocks = {
  [key in 'vehicle' | 'engine' | 'chassis' | 'turret' | 'gun']:
    | UnlocksInner
    | UnlocksInner[];
};
type UnlocksListing = Unlocks | undefined;
interface VehicleDefinitions {
  invisibility: {
    moving: number;
    still: number;
    firePenalty: number;
  };
  crew: Record<CrewMember, string | string[]>;
  speedLimits: {
    forward: number;
    backward: number;
  };
  consumableSlots: number;
  provisionSlots: number;
  optDevicePreset: string | string[];
  hull: {
    armor: VehicleDefinitionArmor;
    turretPositions: { turret: string };
    turretInitialRotation?: { yaw: 0; pitch: 6.5; roll: 0 };
    maxHealth: number;
    weight: number;
  };
  chassis: {
    [key: string]: {
      unlocks: UnlocksListing;
      weight: number;
      terrainResistance: string;
      rotationSpeed: number;
      userString: string;
      shotDispersionFactors: {
        vehicleMovement: number;
        vehicleRotation: number;
      };
      level: number;
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
  engines: {
    [key: string]: {
      unlocks: UnlocksListing;
    };
  };
  turrets0: {
    [key: string]: {
      unlocks: UnlocksListing;
      rotationSpeed: number;
      weight: number;
      circularVisionRadius: number;
      maxHealth: number;
      armor: VehicleDefinitionArmor;
      userString: number;
      level: number;
      yawLimits: string | string[];
      gunPosition: string | string[];
      models: { undamaged: string };
      hitTester: {
        collisionModel: string;
      };
      guns: {
        [key: string]: {
          unlocks: UnlocksListing;
          armor: VehicleDefinitionArmor & {
            gun?:
              | number
              | {
                  chanceToHitByProjectile: number;
                  chanceToHitByExplosion: number;
                  '#text': number;
                };
          };
          invisibilityFactorAtShot: number | number[];
          reloadTime: number;
          aimingTime?: number;
          shotDispersionRadius: number;
          shotDispersionFactors?: {
            turretRotation: number;
            afterShot: number;
            whileGunDamaged: number;
          };
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
      rotationSpeed: number;
      weight: number;
      shotDispersionFactors: {
        turretRotation: number;
        afterShot: number;
        whileGunDamaged: number;
      };
      aimingTime: number;
      shotDispersionRadius: number;
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
    vehicleFilter?: {
      include: { vehicle: ConsumablesVehicleFilter; nations?: string };
      exclude?: { vehicle: ConsumablesVehicleFilter; nations?: string };
    };
    script: {
      '#text': string;
      automatic?: boolean;
      cooldown: number;
      duration?: number;
      shotEffect?: string;
      bonusValues?: { [key: string]: number };
    } & Record<string, string>;
  };
}
export interface ProvisionsCommon {
  [key: string]: {
    id: number;
    userString: string;
    description: string;
    icon: string;
    category: string;
    tags: string;
    vehicleFilter?: {
      include: { vehicle: ConsumablesVehicleFilter; nations?: string };
      exclude?: { vehicle: ConsumablesVehicleFilter; nations?: string };
    };
    script: {
      '#text': string;
      automatic?: boolean;
      shotEffect?: string;
      bonusValues?: { [key: string]: number };
    } & Record<string, string>;
  };
}

type CamouflagesInclude =
  | {
      nations?: string;
    }
  | {
      vehicle?: { name?: string; minLevel?: number; maxLevel?: number };
    };

interface CamouflagesXML {
  camouflages: Record<
    string,
    {
      id: number;
      userString: string;
      description: string;
      category: string;
      group: string;
      kind: string;
      notInShop: boolean;
      unlockCostCategory?: string;
      vehicleFilter: {
        include?: CamouflagesInclude | CamouflagesInclude[];
      };
      script: string[] | string;
      icon?: string;
      unlockPremium?: string;
      unlockQuest?: string;
      unlockClanLevel?: number;
      unlockShopBundle?: string;
      unlockTankRank?: number;
    }
  >;
}

type CamouflagesYaml = Record<
  string,
  {
    userString?: string;
    shortUserString?: string;
  }
>;

type ConsumablesVehicleFilter =
  | { minLevel: number; maxLevel: number }
  | { name: string }
  | { extendedTags: string };

export interface Maps {
  maps: {
    [key: string]: {
      id: number;
      tags?: string;
      localName: string;
      avaliableInTrainingRoom: boolean; // lol wg typo
      spriteFrame: number;
      supremacyPointsThreshold?: number;
      availableModes: number[];
      shadowMapsAvailable?: boolean;
      assaultRespawnPoints: {
        allies: MapAlly[];
        enemies: MapAlly[];
      };
      levels?: number[];
    };
  };
}

export interface MapAlly {
  respawnNumber: number;
  points: Array<number[]>;
}

interface AvailableNationsYaml {
  available_nations: string[];
}

export interface SquadBattleTypeStyles {
  Prototypes: {
    components: {
      UIDataLocalBindingsComponent: {
        data: [string, string, string][];
      };
    };
  }[];
}

type CombatRolesYaml = Record<
  string,
  {
    id: number;
    default_abilities: string[];
  }
>;

const blitzShellKindToBlitzkit: Record<ShellKind, ShellType> = {
  ARMOR_PIERCING: ShellType.AP,
  ARMOR_PIERCING_CR: ShellType.APCR,
  HIGH_EXPLOSIVE: ShellType.HE,
  HOLLOW_CHARGE: ShellType.HEAT,
};
const missingStrings: Record<string, string> = {
  '#artefacts:tungstentip/name': 'Tungsten Shells',
};
export const botPattern = /^.+((tutorial_bot(\d+)?)|(TU(R?)))$/;

export async function definitions() {
  console.log('Building definitions...');

  const wargamingTankopedia = (await fetch(
    `https://api.wotblitz.com/wotb/encyclopedia/vehicles/?application_id=${WARGAMING_APPLICATION_ID}&fields=description`,
  ).then((response) => response.json())) as {
    data: { [key: number]: { description: null | string } };
  };

  const gameDefinitions: GameDefinitions = {
    version: (await readStringDVPL(`${DATA}/version.txt.dvpl`))
      .split(' ')[0]
      .split('.')
      .slice(0, 3)
      .join('.'),
    nations: (
      await readYAMLDVPL<AvailableNationsYaml>(
        `${DATA}/available_nations.yaml.dvpl`,
      )
    ).available_nations,
    gameModes: {},
    roles: {},
  };
  const tankDefinitions: TankDefinitions = {};
  const camouflageDefinitions: CamouflageDefinitions = {};
  const modelDefinitions: ModelDefinitions = {};
  const mapDefinitions: MapDefinitions = {};
  const equipmentDefinitions: EquipmentDefinitions = {
    presets: {},
    equipments: {},
  };
  const consumableDefinitions: ConsumableDefinitions = {};
  const provisionDefinitions: ProvisionDefinitions = {};
  const skillDefinitions: SkillDefinitions = {
    classes: { lightTank: [], mediumTank: [], heavyTank: [], 'AT-SPG': [] },
  };
  const nations = await readdir(`${DATA}/XML/item_defs/vehicles`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );
  const tankStringIdMap: Record<string, number> = {};
  const stringsPreInstalled = await readYAMLDVPL<BlitzStrings>(
    `${DATA}/Strings/en.yaml.dvpl`,
  );
  const stringsCache = await fetch(
    'https://stufficons.wgcdn.co/localizations/en.yaml',
  )
    .then((response) => response.text())
    .then((string) => parseYaml(string) as BlitzStrings);
  const optionalDevices = await readXMLDVPL<{ root: OptionalDevices }>(
    `${DATA}/XML/item_defs/vehicles/common/optional_devices.xml.dvpl`,
  );
  const strings = {
    ...stringsPreInstalled,
    ...stringsCache,
  };
  const optionalDeviceSlots = await readXMLDVPL<{
    root: OptionalDeviceSlots;
  }>(`${DATA}/XML/item_defs/vehicles/common/optional_device_slots.xml.dvpl`);
  const consumables: ConsumablesCommon = {};
  const provisions: ProvisionsCommon = {};

  for (const match of (
    await readStringDVPL(
      `${DATA}/XML/item_defs/vehicles/common/consumables/list.xml.dvpl`,
    )
  ).matchAll(/<items path="(.+)\.xml"\/>/g)) {
    if (match[1] === 'prototypes') continue;

    Object.assign(
      consumables,
      (
        await readXMLDVPL<{ root: ConsumablesCommon }>(
          `${DATA}/XML/item_defs/vehicles/common/consumables/${match[1]}.xml.dvpl`,
        )
      ).root,
    );
  }

  for (const match of (
    await readStringDVPL(
      `${DATA}/XML/item_defs/vehicles/common/provisions/list.xml.dvpl`,
    )
  ).matchAll(/<items path="(.+)\.xml"\/>/g)) {
    if (match[1] === 'prototypes') continue;

    Object.assign(
      provisions,
      (
        await readXMLDVPL<{ root: ConsumablesCommon }>(
          `${DATA}/XML/item_defs/vehicles/common/provisions/${match[1]}.xml.dvpl`,
        )
      ).root,
    );
  }

  const avatar = await readXMLDVPL<{ root: Avatar }>(
    `${DATA}/XML/item_defs/tankmen/avatar.xml.dvpl`,
  );
  const maps = await readYAMLDVPL<Maps>(`${DATA}/maps.yaml.dvpl`);
  const tankXps = new Map<number, number>();
  const camouflagesXml = await readXMLDVPL<{ root: CamouflagesXML }>(
    `${DATA}/XML/item_defs/vehicles/common/camouflages.xml.dvpl`,
  );
  const camouflagesYaml = await readYAMLDVPL<CamouflagesYaml>(
    `${DATA}/camouflages.yaml.dvpl`,
  );
  const camouflagesXmlEntries = Object.entries(camouflagesXml.root.camouflages);
  const squadBattleTypeStyles = await readYAMLDVPL<SquadBattleTypeStyles>(
    `${DATA}/UI/Screens3/Lobby/Hangar/Squad/SquadBattleType.yaml.dvpl`,
  );
  const gameTypeSelectorStyles = await readYAMLDVPL<SquadBattleTypeStyles>(
    `${DATA}/UI/Screens/Lobby/Hangar/GameTypeSelector.yaml.dvpl`,
  );
  const gameModeNativeNames: Record<string, number> = {};
  const combatRoles = await readYAMLDVPL<CombatRolesYaml>(
    `${DATA}/XML/item_defs/vehicles/common/combat_roles.yaml.dvpl`,
  );
  const consumableNativeNames: Record<string, number> = {};
  const provisionNativeNames: Record<string, number> = {};

  for (const match of squadBattleTypeStyles.Prototypes[0].components.UIDataLocalBindingsComponent.data[1][2].matchAll(
    /"(\d+)" -> "(battleType\/([a-zA-Z]+))"/g,
  )) {
    const id = Number(match[1]);
    const name = strings[match[2]];

    gameModeNativeNames[match[3]] = id;
    gameDefinitions.gameModes[id] = {
      name,
    };
  }

  for (const match of gameTypeSelectorStyles.Prototypes[0].components.UIDataLocalBindingsComponent.data[1][2].matchAll(
    /eGameMode\.([a-zA-Z]+) -> "~res:\/Gfx\/UI\/Hangar\/GameTypes\/battle-type_([^"]+)"/g,
  )) {
    Object.entries(gameModeNativeNames).forEach(([key, value]) => {
      if (key.toLowerCase() === match[2].toLowerCase()) {
        gameModeNativeNames[match[1]] = value;
      }
    });
  }

  camouflagesXmlEntries.forEach(([camoKey, camo]) => {
    const yamlEntry = camouflagesYaml[camoKey];
    const fullName = yamlEntry.userString
      ? strings[yamlEntry.userString]
      : undefined;
    const shortName = yamlEntry.shortUserString
      ? strings[yamlEntry.shortUserString]
      : undefined;
    const resolvedTankName = shortName ?? fullName;
    const resolvedTankNameFull =
      resolvedTankName === fullName ? undefined : fullName;

    camouflageDefinitions[camo.id] = {
      id: camo.id,
      name: strings[camo.userString],
      tankName: resolvedTankName,
      tankNameFull: resolvedTankNameFull,
    };
  });

  await Promise.all(
    nations.map(async (nation) => {
      const tankList = await readXMLDVPL<{ root: VehicleDefinitionList }>(
        `${DATA}/XML/item_defs/vehicles/${nation}/list.xml.dvpl`,
      );
      const turretList = await readXMLDVPL<{
        root: TurretDefinitionsList;
      }>(
        `${DATA}/XML/item_defs/vehicles/${nation}/components/turrets.xml.dvpl`,
      );
      const gunList = await readXMLDVPL<{
        root: GunDefinitionsList;
      }>(`${DATA}/XML/item_defs/vehicles/${nation}/components/guns.xml.dvpl`);
      const shellList = await readXMLDVPL<{
        root: ShellDefinitionsList;
      }>(`${DATA}/XML/item_defs/vehicles/${nation}/components/shells.xml.dvpl`);
      const enginesList = await readXMLDVPL<{
        root: EngineDefinitionsList;
      }>(
        `${DATA}/XML/item_defs/vehicles/${nation}/components/engines.xml.dvpl`,
      );
      const chassisList = await readXMLDVPL<{
        root: ChassisDefinitionsList;
      }>(
        `${DATA}/XML/item_defs/vehicles/${nation}/components/chassis.xml.dvpl`,
      );

      function resolveUnlocks(unlocks?: Unlocks) {
        if (!unlocks) return undefined;

        return Object.entries(unlocks)
          .map(([type, list]) =>
            (Array.isArray(list) ? list : [list]).map((item) => {
              const typeTyped = type as keyof Unlocks;
              let rawId: number;

              if (typeTyped === 'chassis') {
                rawId = chassisList.root.ids[item['#text']];
              } else if (typeTyped === 'engine') {
                rawId = enginesList.root.ids[item['#text']];
              } else if (typeTyped === 'gun') {
                rawId = gunList.root.ids[item['#text']];
              } else if (typeTyped === 'turret') {
                rawId = turretList.root.ids[item['#text']];
              } else if (typeTyped === 'vehicle') {
                rawId = tankList.root[item['#text']].id;
              }

              return {
                type: typeTyped,
                id: toUniqueId(nation, rawId!),
                cost: {
                  type:
                    typeof item.cost === 'number'
                      ? 'xp'
                      : item.cost.split(':')[0],
                  value:
                    typeof item.cost === 'number'
                      ? item.cost
                      : Number(item.cost.split(':')[1]),
                },
              } satisfies Unlock;
            }),
          )
          .flat();
      }

      for (const tankKey in tankList.root) {
        if (botPattern.test(tankKey)) continue;

        const gunXps = new Map<number, number>();
        const turretXps = new Map<number, number>();
        const engineXps = new Map<number, number>();
        const trackXps = new Map<number, number>();
        const tank = tankList.root[tankKey];
        let tankPrice: TankPrice;
        const tankDefinition = await readXMLDVPL<{ root: VehicleDefinitions }>(
          `${DATA}/XML/item_defs/vehicles/${nation}/${tankKey}.xml.dvpl`,
        );
        const tankParameters = await readYAMLDVPL<TankParameters>(
          `${DATA}/3d/Tanks/Parameters/${nation}/${tankKey}.yaml.dvpl`,
        );
        const turretOrigin = tankDefinition.root.hull.turretPositions.turret
          .split(' ')
          .map(Number) as Vector3Tuple;
        const tankId = toUniqueId(nation, tank.id);
        const tankTags = tank.tags.split(' ');
        const hullArmor: ModelArmor = { thickness: {} };
        const equipment = tankDefinition.root.optDevicePreset;
        tankStringIdMap[`${nation}:${tankKey}`] = tankId;

        if (tank.sellPrice) {
          tankPrice = {
            type: 'gold',
            value: tank.sellPrice['#text'] * 2,
          };
        } else if (typeof tank.price === 'number') {
          tankPrice = {
            type: 'credits',
            value: tank.price,
          };
        } else {
          tankPrice = {
            type: 'credits',
            value: tank.price['#text'] * 400,
          };
        }

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
        const crew: Crew[] = [];
        const fixedCamouflage = tankTags.includes('eventCamouflage_user');
        const totalUnlocks: UnlocksListing[] = [];

        Object.entries(tankDefinition.root.crew).forEach(([crewKey, value]) => {
          let entry: Crew;
          const index = crew.findIndex(({ type }) => type === crewKey);
          if (index === -1) {
            entry = { type: crewKey as CrewMember };
            crew.push(entry);
          } else {
            entry = crew[index];
          }

          if (typeof value === 'string') {
            if (entry.count === undefined) {
              entry.count = 1;
            } else {
              entry.count++;
            }

            if (value !== '') {
              entry.substitute = value
                .split('\n')
                .map((member) => member.trim()) as CrewMember[];
            }
          } else {
            if (entry.count === undefined) {
              entry.count = value.length;
            } else {
              entry.count += value.length;
            }
          }

          if (entry.count === 1) {
            delete entry.count;
          }
        });

        const camouflages = camouflagesXmlEntries
          .filter(([, camo]) => {
            if (!camo.vehicleFilter.include) return false;
            if (camo.unlockCostCategory !== 'legendary-skins-gold')
              return false;

            const includeArray = Array.isArray(camo.vehicleFilter.include)
              ? camo.vehicleFilter.include
              : [camo.vehicleFilter.include];

            return includeArray.some((filter) => {
              if ('vehicle' in filter && filter.vehicle?.name) {
                return filter.vehicle.name === `${nation}:${tankKey}`;
              }

              return false;
            });
          })
          .map(([, camo]) => camo.id);

        tankDefinitions[tankId] = {
          id: tankId,
          roles: {},
          camouflages: camouflages.length === 0 ? undefined : camouflages,
          description:
            wargamingTankopedia.data[tankId]?.description ?? undefined,
          fixedCamouflage: fixedCamouflage ? true : undefined,
          crew,
          weight: tankDefinition.root.hull.weight,
          health: tankDefinition.root.hull.maxHealth,
          speed: {
            forwards: tankDefinition.root.speedLimits.forward,
            backwards: tankDefinition.root.speedLimits.backward,
          },
          equipment:
            typeof equipment === 'string' ? equipment : equipment.at(-1)!,
          consumables: tankDefinition.root.consumableSlots,
          provisions: tankDefinition.root.provisionSlots,
          name:
            (tank.shortUserString
              ? strings[tank.shortUserString]
              : undefined) ?? strings[tank.userString],
          nameFull: strings[tank.userString],
          nation,
          treeType: tankTags.includes('collectible')
            ? 'collector'
            : (typeof tank.price === 'number' ? false : 'gold' in tank.price)
              ? 'premium'
              : 'researchable',
          tier: tank.level as Tier,
          class: tankTags[0] as TankClass,
          testing: tankTags.includes('testTank'),
          deprecated: tankTags.includes('deprecated'),
          price: tankPrice,
          camouflage: {
            still: tankDefinition.root.invisibility.still,
            moving: tankDefinition.root.invisibility.moving,
            onFire: tankDefinition.root.invisibility.firePenalty,
          },
          turrets: [],
          engines: [],
          tracks: [],
        };

        if (tank.combatRole) {
          Object.entries(tank.combatRole).forEach(([gameMode, role]) => {
            const id = Object.entries(gameModeNativeNames).find(
              ([key]) => key.toLowerCase() === gameMode.toLowerCase(),
            )?.[1];

            if (id === undefined) {
              throw new Error(
                `Unknown game mode in tank ${tankKey}: ${gameMode}`,
              );
            }

            tankDefinitions[tankId].roles[id] = combatRoles[role].id;
          });
        }

        if (tankDefinitions[tankId].name === tankDefinitions[tankId].nameFull) {
          delete tankDefinitions[tankId].nameFull;
        }

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
          boundingBox: tankParameters.collision.hull.bbox,
          turrets: {},
          tracks: {},
        };

        Object.keys(tankDefinition.root.chassis).forEach((key) => {
          const track = tankDefinition.root.chassis[key];
          const trackId = toUniqueId(nation, chassisList.root.ids[key]);
          const terrainResistances = track.terrainResistance
            .split(' ')
            .map(Number);
          const trackArmorRaw = track.armor.leftTrack;
          const hullOrigin = track.hullPosition
            .split(' ')
            .map(Number) as Vector3Tuple;

          totalUnlocks.push(track.unlocks);
          tankDefinitions[tankId].tracks.push({
            id: trackId,
            weight: track.weight,
            name: strings[track.userString],
            traverseSpeed: track.rotationSpeed,
            dispersion: {
              move: track.shotDispersionFactors.vehicleMovement,
              traverse: track.shotDispersionFactors.vehicleRotation,
            },
            resistance: {
              hard: terrainResistances[0],
              medium: terrainResistances[1],
              soft: terrainResistances[2],
            },
            tier: track.level as Tier,
            unlocks: resolveUnlocks(track.unlocks),
          });

          modelDefinitions[tankId].tracks[trackId] = {
            thickness:
              typeof trackArmorRaw === 'number'
                ? trackArmorRaw
                : trackArmorRaw['#text'],
            origin: hullOrigin,
          };
        });

        Object.keys(tankDefinition.root.engines).forEach((engineKey) => {
          const engine = tankDefinition.root.engines[engineKey];
          const engineListEntry = enginesList.root.shared[engineKey];
          const engineId = toUniqueId(nation, enginesList.root.ids[engineKey]);

          totalUnlocks.push(engine.unlocks);
          tankDefinitions[tankId].engines.push({
            id: engineId,
            name: strings[engineListEntry.userString],
            fireChance: engineListEntry.fireStartingChance,
            tier: engineListEntry.level as Tier,
            weight: engineListEntry.weight,
            power: engineListEntry.power,
            unlocks: resolveUnlocks(engine.unlocks),
          });
        });

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

            totalUnlocks.push(turret.unlocks);
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
              traverseSpeed: turret.rotationSpeed,
              name:
                strings[turret.userString] ??
                turretKey
                  .replaceAll('_', ' ')
                  .replace(/^(Turret ([0-9] )?)+/, ''),
              tier: turret.level as Tier,
              guns: [],
              health: turret.maxHealth,
              viewRange: turret.circularVisionRadius,
              weight: turret.weight,
              unlocks: resolveUnlocks(turret.unlocks),
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
              boundingBox:
                tankParameters.collision[
                  parsePath(turret.hitTester.collisionModel).name.toLowerCase()
                ].bbox,
            };

            Object.keys(turret.guns).forEach((gunKey, gunIndex) => {
              const gun = turret.guns[gunKey];
              const gunId = toUniqueId(nation, gunList.root.ids[gunKey]);
              const gunListEntry = gunList.root.shared[gunKey];
              const pitchLimitsRaw =
                gun.pitchLimits ?? gunListEntry.pitchLimits;
              const gunPitch = (
                typeof pitchLimitsRaw === 'string'
                  ? pitchLimitsRaw
                  : pitchLimitsRaw.at(-1)!
              )
                .split(' ')
                .map(Number) as [number, number];
              const gunModel = Number(
                parsePath(gun.models.undamaged).name.split('_')[1],
              );
              const gunName =
                strings[gunListEntry.userString] ?? gunKey.replaceAll('_', ' ');
              const gunType =
                'clip' in gun
                  ? gun.pumpGunMode
                    ? 'autoReloader'
                    : 'autoLoader'
                  : 'regular';
              const gunReload =
                gunType === 'autoReloader'
                  ? gun.pumpGunReloadTimes!.split(' ').map(Number)
                  : gun.reloadTime;
              const gunClipCount =
                gunType === 'regular' ? undefined : gun.clip!.count;
              const gunIntraClip =
                gunType === 'regular' ? undefined : 60 / gun.clip!.rate;
              const front = gun.extraPitchLimits?.front
                ? gun.extraPitchLimits.front.split(' ').map(Number)
                : undefined;
              const back = gun.extraPitchLimits?.back
                ? gun.extraPitchLimits.back.split(' ').map(Number)
                : undefined;
              const transition = gun.extraPitchLimits?.transition
                ? typeof gun.extraPitchLimits.transition === 'number'
                  ? gun.extraPitchLimits.transition
                  : gun.extraPitchLimits.transition.at(-1)!
                : undefined;
              const gunArmor: ModelArmor = { thickness: {} };
              const shotDispersionFactors =
                gun.shotDispersionFactors ?? gunListEntry.shotDispersionFactors;
              const maskName = `gun_${gunModel.toString().padStart(2, '0')}`;
              const maskEnabled =
                tankParameters.maskSlice?.[maskName]?.enabled ?? false;
              let mask: number | undefined;

              if (maskEnabled) {
                const maskRaw = tankParameters.maskSlice![maskName]!;
                mask = maskRaw.planePosition[1];
              } else {
                mask = undefined;
              }

              totalUnlocks.push(gun.unlocks);
              Object.keys(gun.armor)
                .filter((name) => name.startsWith('armor_'))
                .forEach((name) => {
                  const armorIdString = name.match(/armor_(\d+)/)?.[1];
                  if (armorIdString === undefined) {
                    throw new SyntaxError(`Invalid armor id: ${name}`);
                  }
                  const armorId = parseInt(armorIdString);
                  const armorRaw = gun.armor[name];
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
                weight: gunListEntry.weight,
                rotationSpeed: gunListEntry.rotationSpeed,
                name: gunName,
                tier: gunListEntry.level as Tier,
                shells: [],
                type: gunType,
                reload: gunReload,
                count: gunClipCount,
                intraClip: gunIntraClip,
                camouflageLoss:
                  typeof gun.invisibilityFactorAtShot === 'number'
                    ? gun.invisibilityFactorAtShot
                    : gun.invisibilityFactorAtShot.at(-1)!,
                aimTime: gun.aimingTime ?? gunListEntry.aimingTime,
                dispersion: {
                  base:
                    gun.shotDispersionRadius ??
                    gunListEntry.shotDispersionRadius,
                  damaged: shotDispersionFactors.whileGunDamaged,
                  shot: shotDispersionFactors.afterShot,
                  traverse: shotDispersionFactors.turretRotation,
                },
                unlocks: resolveUnlocks(gun.unlocks),
              } as GunDefinition);

              modelDefinitions[tankId].turrets[turretId].guns[gunId] = {
                armor: gunArmor,
                model: gunModel,
                mask,
                thickness:
                  gun.armor.gun === undefined
                    ? 0
                    : typeof gun.armor.gun === 'number'
                      ? gun.armor.gun
                      : gun.armor.gun['#text'],
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
                    module: shell.damage.devices,
                  },
                  caliber: shell.caliber,
                  normalization: shell.normalizationAngle,
                  ricochet: shell.ricochetAngle,
                  type: blitzShellKindToBlitzkit[shell.kind],
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

        totalUnlocks.forEach((unlocks) => {
          if (unlocks === undefined) return;

          Object.entries(unlocks).forEach(([key, value]) => {
            (Array.isArray(value) ? value : [value]).forEach((vehicle) => {
              switch (key as keyof Unlocks) {
                case 'vehicle': {
                  const tankListEntry = tankList.root[vehicle['#text']];
                  const currentTank = tankDefinitions[tankId];
                  const successorId = toUniqueId(nation, tankListEntry.id);

                  tankXps.set(successorId, vehicle.cost as number);

                  if (currentTank.successors === undefined) {
                    currentTank.successors = [];
                  }
                  if (!currentTank.successors!.includes(successorId)) {
                    currentTank.successors!.push(successorId);
                  }
                  break;
                }

                case 'gun': {
                  gunXps.set(
                    toUniqueId(nation, gunList.root.ids[vehicle['#text']]),
                    vehicle.cost as number,
                  );
                  break;
                }

                case 'turret': {
                  turretXps.set(
                    toUniqueId(nation, turretList.root.ids[vehicle['#text']]),
                    vehicle.cost as number,
                  );
                  break;
                }

                case 'engine': {
                  engineXps.set(
                    toUniqueId(nation, enginesList.root.ids[vehicle['#text']]),
                    vehicle.cost as number,
                  );
                  break;
                }

                case 'chassis': {
                  trackXps.set(
                    toUniqueId(nation, chassisList.root.ids[vehicle['#text']]),
                    vehicle.cost as number,
                  );
                  break;
                }
              }
            });
          });
        });

        Object.values(tankDefinitions[tankId].turrets).forEach((turret) => {
          turret.xp = turretXps.get(turret.id);

          Object.values(turret.guns).forEach((gun) => {
            gun.xp = gunXps.get(gun.id);
          });
        });

        Object.values(tankDefinitions[tankId].engines).forEach((engine) => {
          engine.xp = engineXps.get(engine.id);
        });

        Object.values(tankDefinitions[tankId].tracks).forEach((track) => {
          track.xp = trackXps.get(track.id);
        });
      }
    }),
  );

  Object.values(tankDefinitions).forEach((tank) => {
    tank.xp = tankXps.get(tank.id);
  });

  Object.values(tankDefinitions).forEach((tank) => {
    tank.successors?.forEach((predecessorId) => {
      if (tankDefinitions[predecessorId].ancestors === undefined) {
        tankDefinitions[predecessorId].ancestors = [];
      }

      if (!tankDefinitions[predecessorId].ancestors?.includes(tank.id)) {
        tankDefinitions[predecessorId].ancestors?.push(tank.id);
      }
    });
  });

  Object.entries(optionalDevices.root).forEach(
    ([optionalDeviceKey, optionalDeviceEntry]) => {
      if (optionalDeviceKey === 'nextAvailableId') return;

      equipmentDefinitions.equipments[optionalDeviceEntry.id] = {
        name: strings[optionalDeviceEntry.userString],
        description: strings[optionalDeviceEntry.description],
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

  Object.entries(consumables).forEach(([key, consumable]) => {
    consumableNativeNames[key] = consumable.id;

    const entry = {
      id: consumable.id,
      gameMode: 'gameModeFilter' in consumable,
      cooldown: consumable.script.cooldown,
      duration: consumable.script.duration,
      name:
        strings[consumable.userString] ??
        missingStrings[consumable.userString] ??
        `Unknown ${consumable.id}`,
    } as ConsumableEntry;
    consumableDefinitions[consumable.id] = entry;

    const includeRaw = consumable.vehicleFilter?.include.vehicle;
    const excludeRaw = consumable.vehicleFilter?.exclude?.vehicle;

    if (!entry.gameMode) {
      if (includeRaw) {
        entry.include = [];

        if ('minLevel' in includeRaw) {
          entry.include.push({
            type: 'tier',
            min: includeRaw.minLevel,
            max: includeRaw.maxLevel,
          });
        } else if ('name' in includeRaw) {
          entry.include.push({
            type: 'ids',
            ids: includeRaw.name.split(' ').map((key) => tankStringIdMap[key]),
          });
        } else throw new SyntaxError('Unhandled include type');

        if (consumable.vehicleFilter?.include.nations) {
          entry.include.push({
            type: 'nation',
            nations: consumable.vehicleFilter.include.nations.split(' '),
          });
        }
      }

      if (excludeRaw) {
        entry.exclude = [];

        if ('name' in excludeRaw) {
          entry.exclude!.push({
            type: 'ids',
            ids: excludeRaw.name.split(' ').map((key) => tankStringIdMap[key]),
          });
        } else if ('extendedTags' in excludeRaw) {
          entry.exclude!.push({
            type: 'category',
            categories: excludeRaw.extendedTags.split(
              ' ',
            ) as TankFilterDefinitionCategory[],
          });
        } else throw new SyntaxError('Unhandled exclude type');

        if (consumable.vehicleFilter?.exclude?.nations) {
          entry.exclude!.push({
            type: 'nation',
            nations: consumable.vehicleFilter.exclude.nations.split(' '),
          });
        }
      }
    }
  });

  Object.entries(provisions).forEach(([key, provision]) => {
    provisionNativeNames[key] = provision.id;

    const entry = {
      id: provision.id,
      gameMode: 'gameModeFilter' in provision,
      name:
        strings[provision.userString] ??
        missingStrings[provision.userString] ??
        `Unknown ${provision.id}`,
    } as ProvisionEntry;
    provisionDefinitions[provision.id] = entry;

    const includeRaw = provision.vehicleFilter?.include.vehicle;
    const excludeRaw = provision.vehicleFilter?.exclude?.vehicle;

    if (!entry.gameMode) {
      if (includeRaw) {
        entry.include = [];

        if ('minLevel' in includeRaw) {
          entry.include.push({
            type: 'tier',
            min: includeRaw.minLevel,
            max: includeRaw.maxLevel,
          });
        } else if ('name' in includeRaw) {
          entry.include.push({
            type: 'ids',
            ids: includeRaw.name.split(' ').map((key) => tankStringIdMap[key]),
          });
        } else throw new SyntaxError('Unhandled include type');

        if (provision.vehicleFilter?.include.nations) {
          entry.include.push({
            type: 'nation',
            nations: provision.vehicleFilter.include.nations.split(' '),
          });
        }
      }

      if (excludeRaw) {
        entry.exclude = [];

        if ('name' in excludeRaw) {
          entry.exclude!.push({
            type: 'ids',
            ids: excludeRaw.name.split(' ').map((key) => tankStringIdMap[key]),
          });
        } else if ('extendedTags' in excludeRaw) {
          entry.exclude!.push({
            type: 'category',
            categories: excludeRaw.extendedTags.split(
              ' ',
            ) as TankFilterDefinitionCategory[],
          });
        } else throw new SyntaxError('Unhandled exclude type');

        if (provision.vehicleFilter?.exclude?.nations) {
          entry.exclude!.push({
            type: 'nation',
            nations: provision.vehicleFilter.exclude.nations.split(' '),
          });
        }
      }
    }

    if (provision.script.bonusValues?.crewLevelIncrease !== undefined) {
      provisionDefinitions[provision.id].crew =
        provision.script.bonusValues?.crewLevelIncrease;
    }
  });

  Object.entries(combatRoles).forEach(([, value]) => {
    gameDefinitions.roles[value.id] = { provisions: [], consumables: [] };

    value.default_abilities.forEach((ability) => {
      if (ability in consumableNativeNames) {
        gameDefinitions.roles[value.id].consumables.push(
          consumableNativeNames[ability],
        );
      } else if (ability in provisionNativeNames) {
        gameDefinitions.roles[value.id].provisions.push(
          provisionNativeNames[ability],
        );
      } else throw new Error(`Unknown ability ${ability}`);
    });
  });

  Object.entries(avatar.root.skillsByClasses).forEach(([tankClass, skills]) => {
    skillDefinitions.classes[tankClass as TankClass] = skills.split(' ');
  });

  Object.entries(maps.maps).forEach(([key, map]) => {
    mapDefinitions[map.id] = {
      id: map.id,
      name: strings[`#maps:${key}:${map.localName}`],
    };
  });

  await commitAssets('definitions', [
    {
      content: superCompress(gameDefinitions),
      encoding: 'base64',
      path: 'definitions/game.cdon.lz4',
    },
    {
      content: superCompress(tankDefinitions),
      encoding: 'base64',
      path: 'definitions/tanks.cdon.lz4',
    },
    {
      content: superCompress(modelDefinitions),
      encoding: 'base64',
      path: 'definitions/models.cdon.lz4',
    },
    {
      content: superCompress(equipmentDefinitions),
      encoding: 'base64',
      path: 'definitions/equipment.cdon.lz4',
    },
    {
      content: superCompress(consumableDefinitions),
      encoding: 'base64',
      path: 'definitions/consumables.cdon.lz4',
    },
    {
      content: superCompress(provisionDefinitions),
      encoding: 'base64',
      path: 'definitions/provisions.cdon.lz4',
    },
    {
      content: superCompress(skillDefinitions),
      encoding: 'base64',
      path: 'definitions/skills.cdon.lz4',
    },
    {
      content: superCompress(mapDefinitions),
      encoding: 'base64',
      path: 'definitions/maps.cdon.lz4',
    },
    {
      content: superCompress(camouflageDefinitions),
      encoding: 'base64',
      path: 'definitions/camouflages.cdon.lz4',
    },
  ]);
}
