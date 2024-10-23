import {
  Armor,
  assertSecret,
  CamouflageDefinitions,
  Consumable,
  ConsumableDefinitions,
  ConsumableTankCategoryFilterCategory,
  Crew,
  CrewType,
  encodePBBuffer,
  EquipmentDefinitions,
  EquipmentSlot,
  GameDefinitions,
  GunDefinition,
  GunDefinitionBase,
  MapDefinitions,
  ModelDefinitions,
  ModuleType,
  Provision,
  ProvisionDefinitions,
  ResearchCost,
  ShellType,
  SkillDefinitions,
  TankClass,
  TankDefinitions,
  TankPrice,
  TankPriceType,
  TankType,
  Tier,
  toUniqueId,
  Unlock,
  Vector3,
} from '@blitzkit/core';
import { readdir } from 'fs/promises';
import { parse as parsePath } from 'path';
import { Vector3Tuple } from 'three';
import { parse as parseYaml } from 'yaml';
import { readStringDVPL } from '../core/blitz/readStringDVPL';
import { readXMLDVPL } from '../core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../core/blitz/readYAMLDVPL';
import { commitAssets } from '../core/github/commitAssets';
import { DATA } from './constants';
import { Avatar } from './skillIcons';
import { TankParameters } from './tankIcons';

function parseResearchCost(raw: number | string) {
  if (typeof raw === 'number') {
    return {
      research_cost_type: { $case: 'xp', value: raw },
    } satisfies ResearchCost;
  } else {
    return {
      research_cost_type: {
        $case: 'seasonal_tokens',
        value: {
          season: Number(/prx_season_(\d+):\d+/.exec(raw)![1]),
          tokens: Number(/prx_season_\d+:(\d+)/.exec(raw)![1]),
        },
      },
    } satisfies ResearchCost;
  }
}

type BlitzTankFilterDefinitionCategory = 'clip';
const blitzTankFilterDefinitionCategoryToBlitzkit: Record<
  BlitzTankFilterDefinitionCategory,
  ConsumableTankCategoryFilterCategory
> = {
  clip: ConsumableTankCategoryFilterCategory.CLIP,
};
function vector3TupleToBlitzkit(tuple: Vector3Tuple) {
  return { x: tuple[0], y: tuple[1], z: tuple[2] } satisfies Vector3;
}
type BlitzTankClass = 'lightTank' | 'mediumTank' | 'heavyTank' | 'AT-SPG';
const blitzTankClassToBlitzkit: Record<BlitzTankClass, TankClass> = {
  lightTank: TankClass.LIGHT,
  'AT-SPG': TankClass.TANK_DESTROYER,
  heavyTank: TankClass.HEAVY,
  mediumTank: TankClass.MEDIUM,
};
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
    normalizationAngle?: number;
    ricochetAngle?: number;
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
type BlitzModuleType = {
  [key in 'vehicle' | 'engine' | 'chassis' | 'turret' | 'gun']:
    | UnlocksInner
    | UnlocksInner[];
};
type UnlocksListing = BlitzModuleType | undefined;
type BlitzCrewType = 'commander' | 'radioman' | 'gunner' | 'driver' | 'loader';
const blitzCrewTypeToBlitzkit: Record<BlitzCrewType, CrewType> = {
  commander: CrewType.COMMANDER,
  driver: CrewType.DRIVER,
  gunner: CrewType.GUNNER,
  loader: CrewType.LOADER,
  radioman: CrewType.RADIOMAN,
};
const blitzkitCrewTypeToBlitz: Record<CrewType, BlitzCrewType> = {
  [CrewType.COMMANDER]: 'commander',
  [CrewType.DRIVER]: 'driver',
  [CrewType.GUNNER]: 'gunner',
  [CrewType.LOADER]: 'loader',
  [CrewType.RADIOMAN]: 'radioman',
};
interface VehicleDefinitions {
  invisibility: {
    moving: number;
    still: number;
    firePenalty: number;
  };
  crew: Record<BlitzCrewType, string | string[]>;
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
  extras?: {
    armorsStatesController?: {
      state: [
        {
          id: 0;
          armors: string;
          type: 'default';
          enabled: true;
          factorsModifiers: '';
          default: '';
        },
        {
          id: 1;
          armors: string;
          type: 'default';
          enabled: false;
          factorsModifiers: '';
        },
      ];
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
const blitzModuleTypeToBlitzkit: Record<keyof BlitzModuleType, ModuleType> = {
  chassis: ModuleType.TRACKS,
  engine: ModuleType.ENGINE,
  gun: ModuleType.GUN,
  turret: ModuleType.TURRET,
  vehicle: ModuleType.VEHICLE,
};

export async function definitions() {
  console.log('Building definitions...');

  const wargamingTankopedia = (await fetch(
    `https://api.wotblitz.com/wotb/encyclopedia/vehicles/?application_id=${assertSecret(
      process.env.PUBLIC_WARGAMING_APPLICATION_ID,
    )}&fields=description`,
  ).then((response) => response.json())) as {
    data: { [key: number]: { description: null | string } };
  };

  const gameDefinitions: GameDefinitions = {
    version: (await readStringDVPL(`${DATA}/version.txt.dvpl`)).split(' ')[0],
    nations: (
      await readYAMLDVPL<AvailableNationsYaml>(
        `${DATA}/available_nations.yaml.dvpl`,
      )
    ).available_nations,
    gameModes: {},
    roles: {},
  };
  const tankDefinitions: TankDefinitions = { tanks: {} };
  const camouflageDefinitions: CamouflageDefinitions = { camouflages: {} };
  const modelDefinitions: ModelDefinitions = { models: {} };
  const mapDefinitions: MapDefinitions = { maps: {} };
  const equipmentDefinitions: EquipmentDefinitions = {
    presets: {},
    equipments: {},
  };
  const consumableDefinitions: ConsumableDefinitions = { consumables: {} };
  const provisionDefinitions: ProvisionDefinitions = { provisions: {} };
  const skillDefinitions: SkillDefinitions = {
    classes: {
      [TankClass.LIGHT]: { skills: [] },
      [TankClass.MEDIUM]: { skills: [] },
      [TankClass.HEAVY]: { skills: [] },
      [TankClass.TANK_DESTROYER]: { skills: [] },
    },
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
  const tankXps = new Map<number, ResearchCost>();
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

    camouflageDefinitions.camouflages[camo.id] = {
      id: camo.id,
      name: strings[camo.userString],
      tank_name: resolvedTankName,
      tank_name_full: resolvedTankNameFull,
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

      function resolveUnlocks(unlocks?: BlitzModuleType) {
        if (!unlocks) return [];

        return Object.entries(unlocks)
          .map(([type, list]) =>
            (Array.isArray(list) ? list : [list]).map((item) => {
              const typeTyped = type as keyof BlitzModuleType;
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
                id: toUniqueId(nation, rawId!),
                type: blitzModuleTypeToBlitzkit[typeTyped],
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

        const gunXps = new Map<number, ResearchCost>();
        const turretXps = new Map<number, ResearchCost>();
        const engineXps = new Map<number, ResearchCost>();
        const trackXps = new Map<number, ResearchCost>();
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
        const hullArmor: Armor = { spaced: [], thickness: {} };
        const equipment = tankDefinition.root.optDevicePreset;
        tankStringIdMap[`${nation}:${tankKey}`] = tankId;

        if (tank.sellPrice) {
          tankPrice = {
            type: TankPriceType.GOLD,
            value: tank.sellPrice['#text'] * 2,
          };
        } else if (typeof tank.price === 'number') {
          tankPrice = {
            type: TankPriceType.CREDITS,
            value: tank.price,
          };
        } else {
          tankPrice = {
            type: TankPriceType.CREDITS,
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
          const index = crew.findIndex(
            ({ type }) => blitzkitCrewTypeToBlitz[type] === crewKey,
          );
          if (index === -1) {
            if (crewKey === '#text') return;
            entry = {
              type: blitzCrewTypeToBlitzkit[crewKey as BlitzCrewType],
              count: 1,
              substitute: [],
            };
            crew.push(entry);
          } else {
            entry = crew[index];
          }

          if (typeof value === 'string') {
            entry.count++;

            if (value !== '') {
              entry.substitute = value.split(/\n| /).map((member) => {
                return blitzCrewTypeToBlitzkit[member.trim() as BlitzCrewType];
              });
            }
          } else {
            if (entry.count === undefined) {
              entry.count = value.length;
            } else {
              entry.count += value.length;
            }
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

        tankDefinitions.tanks[tankId] = {
          ancestors: [],
          successors: [],
          id: tankId,
          roles: {},
          camouflages: camouflages,
          description:
            wargamingTankopedia.data[tankId]?.description ?? undefined,
          fixed_camouflage: fixedCamouflage,
          crew,
          weight: tankDefinition.root.hull.weight,
          health: tankDefinition.root.hull.maxHealth,
          speed_forwards: tankDefinition.root.speedLimits.forward,
          speed_backwards: tankDefinition.root.speedLimits.backward,
          equipment_preset:
            typeof equipment === 'string' ? equipment : equipment.at(-1)!,
          max_consumables: tankDefinition.root.consumableSlots,
          max_provisions: tankDefinition.root.provisionSlots,
          name:
            (tank.shortUserString
              ? strings[tank.shortUserString]
              : undefined) ?? strings[tank.userString],
          name_full: strings[tank.userString],
          nation,
          type: tankTags.includes('collectible')
            ? TankType.COLLECTOR
            : (typeof tank.price === 'number' ? false : 'gold' in tank.price)
              ? TankType.PREMIUM
              : TankType.RESEARCHABLE,
          tier: (tank.level - 1) as Tier,
          class: blitzTankClassToBlitzkit[tankTags[0] as BlitzTankClass],
          testing: tankTags.includes('testTank'),
          deprecated: tankTags.includes('deprecated'),
          price: tankPrice,
          camouflage_still: tankDefinition.root.invisibility.still,
          camouflage_moving: tankDefinition.root.invisibility.moving,
          camouflage_onFire: tankDefinition.root.invisibility.firePenalty,
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

            tankDefinitions.tanks[tankId].roles[id] = combatRoles[role].id;
          });
        }

        if (
          tankDefinitions.tanks[tankId].name ===
          tankDefinitions.tanks[tankId].name_full
        ) {
          delete tankDefinitions.tanks[tankId].name_full;
        }

        modelDefinitions.models[tankId] = {
          armor: hullArmor,
          turret_origin: vector3TupleToBlitzkit(turretOrigin),
          initial_turret_rotation: tankDefinition.root.hull
            .turretInitialRotation
            ? {
                yaw: tankDefinition.root.hull.turretInitialRotation.yaw,
                pitch: tankDefinition.root.hull.turretInitialRotation.pitch,
                roll: tankDefinition.root.hull.turretInitialRotation.roll,
              }
            : undefined,
          bounding_box: {
            min: vector3TupleToBlitzkit(tankParameters.collision.hull.bbox.min),
            max: vector3TupleToBlitzkit(tankParameters.collision.hull.bbox.max),
          },
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
          tankDefinitions.tanks[tankId].tracks.push({
            id: trackId,
            weight: track.weight,
            name: strings[track.userString],
            traverse_speed: track.rotationSpeed,
            dispersion_move: track.shotDispersionFactors.vehicleMovement,
            dispersion_traverse: track.shotDispersionFactors.vehicleRotation,
            resistance_hard: terrainResistances[0],
            resistance_medium: terrainResistances[1],
            resistance_soft: terrainResistances[2],
            tier: (track.level - 1) as Tier,
            unlocks: resolveUnlocks(track.unlocks),
          });

          modelDefinitions.models[tankId].tracks[trackId] = {
            thickness:
              typeof trackArmorRaw === 'number'
                ? trackArmorRaw
                : trackArmorRaw['#text'],
            origin: vector3TupleToBlitzkit(hullOrigin),
          };
        });

        Object.keys(tankDefinition.root.engines).forEach((engineKey) => {
          const engine = tankDefinition.root.engines[engineKey];
          const engineListEntry = enginesList.root.shared[engineKey];
          const engineId = toUniqueId(nation, enginesList.root.ids[engineKey]);

          totalUnlocks.push(engine.unlocks);
          tankDefinitions.tanks[tankId].engines.push({
            id: engineId,
            name: strings[engineListEntry.userString],
            fire_chance: engineListEntry.fireStartingChance,
            tier: (engineListEntry.level - 1) as Tier,
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
            const turretArmor: Armor = { thickness: {}, spaced: [] };

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

            tankDefinitions.tanks[tankId].turrets.push({
              id: turretId,
              traverse_speed: turret.rotationSpeed,
              name:
                strings[turret.userString] ??
                turretKey
                  .replaceAll('_', ' ')
                  .replace(/^(Turret ([0-9] )?)+/, ''),
              tier: (turret.level - 1) as Tier,
              guns: [],
              health: turret.maxHealth,
              view_range: turret.circularVisionRadius,
              weight: turret.weight,
              unlocks: resolveUnlocks(turret.unlocks),
            });

            modelDefinitions.models[tankId].turrets[turretId] = {
              armor: turretArmor,
              gun_origin: vector3TupleToBlitzkit(gunOrigin),
              model_id: turretModel,
              yaw:
                -turretYaw[0] + turretYaw[1] === 360
                  ? undefined
                  : { min: turretYaw[0], max: turretYaw[1] },
              guns: {},
              bounding_box: {
                min: vector3TupleToBlitzkit(
                  tankParameters.collision[
                    parsePath(
                      turret.hitTester.collisionModel,
                    ).name.toLowerCase()
                  ].bbox.min,
                ),
                max: vector3TupleToBlitzkit(
                  tankParameters.collision[
                    parsePath(
                      turret.hitTester.collisionModel,
                    ).name.toLowerCase()
                  ].bbox.max,
                ),
              },
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
              // const gunReload = gun.reloadTime;
              // const shellReloads =
              const gunClipCount = gunType === 'regular' ? 1 : gun.clip!.count;
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
              const gunArmor: Armor = { thickness: {}, spaced: [] };
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

              const base = {
                id: gunId,
                weight: gunListEntry.weight,
                rotation_speed: gunListEntry.rotationSpeed,
                name: gunName,
                tier: (gunListEntry.level - 1) as Tier,
                shells: [],
                camouflage_loss:
                  typeof gun.invisibilityFactorAtShot === 'number'
                    ? gun.invisibilityFactorAtShot
                    : gun.invisibilityFactorAtShot.at(-1)!,
                aim_time: gun.aimingTime ?? gunListEntry.aimingTime,
                dispersion_base:
                  gun.shotDispersionRadius ?? gunListEntry.shotDispersionRadius,
                dispersion_damaged: shotDispersionFactors.whileGunDamaged,
                dispersion_shot: shotDispersionFactors.afterShot,
                dispersion_traverse: shotDispersionFactors.turretRotation,
                unlocks: resolveUnlocks(gun.unlocks),
              } satisfies GunDefinitionBase;

              tankDefinitions.tanks[tankId].turrets[turretIndex].guns.push({
                gun_type:
                  gunType === 'regular'
                    ? {
                        $case: 'regular',
                        value: {
                          base,
                          extension: { reload: gun.reloadTime },
                        },
                      }
                    : gunType === 'autoReloader'
                      ? {
                          $case: 'auto_reloader',
                          value: {
                            base,
                            extension: {
                              intra_clip: 60 / gun.clip!.rate,
                              shell_count: gunClipCount,
                              shell_reloads: gun
                                .pumpGunReloadTimes!.split(' ')
                                .map(Number),
                            },
                          },
                        }
                      : {
                          $case: 'auto_loader',
                          value: {
                            base,
                            extension: {
                              intra_clip: 60 / gun.clip!.rate,
                              clip_reload: gun.reloadTime,
                              shell_count: gunClipCount,
                            },
                          },
                        },
              } satisfies GunDefinition);

              modelDefinitions.models[tankId].turrets[turretId].guns[gunId] = {
                armor: gunArmor,
                model_id: gunModel,
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

                tankDefinitions.tanks[tankId].turrets[turretIndex].guns[
                  gunIndex
                ].gun_type!.value.base.shells.push({
                  id: shellId,
                  name: shellName,
                  velocity: gunShellEntry.speed,
                  armor_damage: shell.damage.armor,
                  module_damage: shell.damage.devices,
                  caliber: shell.caliber,
                  normalization: shell.normalizationAngle,
                  ricochet: shell.ricochetAngle,
                  type: blitzShellKindToBlitzkit[shell.kind],
                  explosion_radius:
                    shell.kind === 'HIGH_EXPLOSIVE'
                      ? (shell.explosionRadius ?? 0)
                      : undefined,
                  icon: shell.icon,
                  penetration: {
                    near: penetrationRaw[0],
                    far: penetrationRaw[1],
                  },
                });
              });
            });
          },
        );

        totalUnlocks.forEach((unlocks) => {
          if (unlocks === undefined) return;

          Object.entries(unlocks).forEach(([key, value]) => {
            (Array.isArray(value) ? value : [value]).forEach((vehicle) => {
              switch (key as keyof BlitzModuleType) {
                case 'vehicle': {
                  const tankListEntry = tankList.root[vehicle['#text']];
                  const currentTank = tankDefinitions.tanks[tankId];
                  const successorId = toUniqueId(nation, tankListEntry.id);

                  tankXps.set(successorId, parseResearchCost(vehicle.cost));

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
                    parseResearchCost(vehicle.cost),
                  );
                  break;
                }

                case 'turret': {
                  turretXps.set(
                    toUniqueId(nation, turretList.root.ids[vehicle['#text']]),
                    parseResearchCost(vehicle.cost),
                  );
                  break;
                }

                case 'engine': {
                  engineXps.set(
                    toUniqueId(nation, enginesList.root.ids[vehicle['#text']]),
                    parseResearchCost(vehicle.cost),
                  );
                  break;
                }

                case 'chassis': {
                  trackXps.set(
                    toUniqueId(nation, chassisList.root.ids[vehicle['#text']]),
                    parseResearchCost(vehicle.cost),
                  );
                  break;
                }
              }
            });
          });
        });

        Object.values(tankDefinitions.tanks[tankId].turrets).forEach(
          (turret) => {
            turret.research_cost = turretXps.get(turret.id);

            Object.values(turret.guns).forEach((gunRaw) => {
              gunRaw.gun_type!.value.base.research_cost = gunXps.get(
                gunRaw.gun_type!.value.base.id,
              );
            });
          },
        );

        Object.values(tankDefinitions.tanks[tankId].engines).forEach(
          (engine) => {
            engine.research_cost = engineXps.get(engine.id);
          },
        );

        Object.values(tankDefinitions.tanks[tankId].tracks).forEach((track) => {
          track.research_cost = trackXps.get(track.id);
        });
      }
    }),
  );

  Object.values(tankDefinitions.tanks).forEach((tank) => {
    tank.research_cost = tankXps.get(tank.id);
  });

  Object.values(tankDefinitions.tanks).forEach((tank) => {
    tank.successors?.forEach((predecessorId) => {
      if (!tankDefinitions.tanks[predecessorId].ancestors?.includes(tank.id)) {
        tankDefinitions.tanks[predecessorId].ancestors?.push(tank.id);
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

      equipmentDefinitions.presets[optionalDeviceSlotKey] = {
        slots: Object.values(optionalDeviceSlotEntry)
          .map((level) => {
            return Object.values(level).map((options) => {
              return {
                left: optionalDevices.root[options.device0].id,
                right: optionalDevices.root[options.device1].id,
              } satisfies EquipmentSlot;
            });
          })
          .flat(),
      };
    },
  );

  Object.entries(consumables).forEach(([key, consumable]) => {
    consumableNativeNames[key] = consumable.id;

    const entry: Consumable = {
      id: consumable.id,
      game_mode_exclusive: 'gameModeFilter' in consumable,
      cooldown: consumable.script.cooldown,
      duration: consumable.script.duration,
      name:
        strings[consumable.userString] ??
        missingStrings[consumable.userString] ??
        `Unknown ${consumable.id}`,
      exclude: [],
      include: [],
    };
    consumableDefinitions.consumables[consumable.id] = entry;

    const includeRaw = consumable.vehicleFilter?.include.vehicle;
    const excludeRaw = consumable.vehicleFilter?.exclude?.vehicle;

    if (!entry.game_mode_exclusive) {
      if (includeRaw) {
        entry.include = [];

        if ('minLevel' in includeRaw) {
          entry.include.push({
            filter_type: {
              $case: 'tiers',
              value: { min: includeRaw.minLevel, max: includeRaw.maxLevel },
            },
          });
        } else if ('name' in includeRaw) {
          entry.include.push({
            filter_type: {
              $case: 'ids',
              value: {
                ids: includeRaw.name.split(/ +/).map((key) => {
                  return tankStringIdMap[key];
                }),
              },
            },
          });
        } else throw new SyntaxError('Unhandled include type');

        if (consumable.vehicleFilter?.include.nations) {
          entry.include.push({
            filter_type: {
              $case: 'nations',
              value: {
                nations: consumable.vehicleFilter.include.nations.split(' '),
              },
            },
          });
        }
      }

      if (excludeRaw) {
        entry.exclude = [];

        if ('name' in excludeRaw) {
          entry.exclude!.push({
            filter_type: {
              $case: 'ids',
              value: {
                ids: excludeRaw.name.split(/ +/).map((key) => {
                  return tankStringIdMap[key];
                }),
              },
            },
          });
        } else if ('extendedTags' in excludeRaw) {
          entry.exclude!.push({
            filter_type: {
              $case: 'categories',
              value: {
                categories: excludeRaw.extendedTags
                  .split(' ')
                  .map(
                    (item) =>
                      blitzTankFilterDefinitionCategoryToBlitzkit[
                        item as BlitzTankFilterDefinitionCategory
                      ],
                  ),
              },
            },
          });
        } else throw new SyntaxError('Unhandled exclude type');

        if (consumable.vehicleFilter?.exclude?.nations) {
          entry.exclude!.push({
            filter_type: {
              $case: 'nations',
              value: {
                nations: consumable.vehicleFilter.exclude.nations.split(' '),
              },
            },
          });
        }
      }
    }
  });

  Object.entries(provisions).forEach(([key, provision]) => {
    provisionNativeNames[key] = provision.id;

    const entry: Provision = {
      id: provision.id,
      exclude: [],
      include: [],
      game_mode_exclusive: 'gameModeFilter' in provision,
      name:
        strings[provision.userString] ??
        missingStrings[provision.userString] ??
        `Unknown ${provision.id}`,
    };
    provisionDefinitions.provisions[provision.id] = entry;

    const includeRaw = provision.vehicleFilter?.include.vehicle;
    const excludeRaw = provision.vehicleFilter?.exclude?.vehicle;

    if (!entry.game_mode_exclusive) {
      if (includeRaw) {
        entry.include = [];

        if ('minLevel' in includeRaw) {
          entry.include.push({
            filter_type: {
              $case: 'tiers',
              value: {
                min: includeRaw.minLevel,
                max: includeRaw.maxLevel,
              },
            },
          });
        } else if ('name' in includeRaw) {
          entry.include.push({
            filter_type: {
              $case: 'ids',
              value: {
                ids: includeRaw.name.split(/ +/).map((key) => {
                  return tankStringIdMap[key];
                }),
              },
            },
          });
        } else throw new SyntaxError('Unhandled include type');

        if (provision.vehicleFilter?.include.nations) {
          entry.include.push({
            filter_type: {
              $case: 'nations',
              value: {
                nations: provision.vehicleFilter.include.nations.split(' '),
              },
            },
          });
        }
      }

      if (excludeRaw) {
        entry.exclude = [];

        if ('name' in excludeRaw) {
          entry.exclude!.push({
            filter_type: {
              $case: 'ids',
              value: {
                ids: excludeRaw.name
                  .split(/ +/)
                  .map((key) => tankStringIdMap[key]),
              },
            },
          });
        } else if ('extendedTags' in excludeRaw) {
          entry.exclude!.push({
            filter_type: {
              $case: 'categories',
              value: {
                categories: excludeRaw.extendedTags
                  .split(' ')
                  .map(
                    (item) =>
                      blitzTankFilterDefinitionCategoryToBlitzkit[
                        item as BlitzTankFilterDefinitionCategory
                      ],
                  ),
              },
            },
          });
        } else throw new SyntaxError('Unhandled exclude type');

        if (provision.vehicleFilter?.exclude?.nations) {
          entry.exclude!.push({
            filter_type: {
              $case: 'nations',
              value: {
                nations: provision.vehicleFilter.exclude.nations.split(' '),
              },
            },
          });
        }
      }
    }

    if (provision.script.bonusValues?.crewLevelIncrease !== undefined) {
      provisionDefinitions.provisions[provision.id].crew =
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
    skillDefinitions.classes[
      blitzTankClassToBlitzkit[tankClass as BlitzTankClass]
    ] = {
      skills: skills.split(' '),
    };
  });

  Object.entries(maps.maps).forEach(([key, map]) => {
    mapDefinitions.maps[map.id] = {
      id: map.id,
      name: strings[`#maps:${key}:${map.localName}`],
    };
  });

  await commitAssets('definitions', [
    {
      content: encodePBBuffer(GameDefinitions, gameDefinitions),
      path: 'definitions/game.pb',
    },
    {
      content: encodePBBuffer(TankDefinitions, tankDefinitions),
      path: 'definitions/tanks.pb',
    },
    {
      content: encodePBBuffer(ModelDefinitions, modelDefinitions),
      path: 'definitions/models.pb',
    },
    {
      content: encodePBBuffer(EquipmentDefinitions, equipmentDefinitions),
      path: 'definitions/equipment.pb',
    },
    {
      content: encodePBBuffer(ConsumableDefinitions, consumableDefinitions),
      path: 'definitions/consumables.pb',
    },
    {
      content: encodePBBuffer(ProvisionDefinitions, provisionDefinitions),
      path: 'definitions/provisions.pb',
    },
    {
      content: encodePBBuffer(SkillDefinitions, skillDefinitions),
      path: 'definitions/skills.pb',
    },
    {
      content: encodePBBuffer(MapDefinitions, mapDefinitions),
      path: 'definitions/maps.pb',
    },
    {
      content: encodePBBuffer(CamouflageDefinitions, camouflageDefinitions),
      path: 'definitions/camouflages.pb',
    },
  ]);
}
