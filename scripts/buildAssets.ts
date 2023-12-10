import { config } from 'dotenv';
import { existsSync } from 'fs';
import { mkdir, readdir, rm } from 'fs/promises';
import { argv } from 'process';
import { TankType } from '../src/components/Tanks';
import { NATION_IDS } from '../src/constants/nations';
import { SCPGStream } from '../src/core/blitz/SCPGStream';
import { readBase64DVPL } from '../src/core/blitz/readBase64DVPL';
import { readXMLDVPL } from '../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../src/core/blitz/readYAMLDVPL';
import commitMultipleFiles, {
  FileChange,
} from '../src/core/blitzkrieg/commitMultipleFiles';
import {
  TankDefinitions,
  Tier,
} from '../src/core/blitzkrieg/definitions/tanks';

config();

interface VehicleDefinitionList {
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
interface Strings {
  [key: string]: string;
}
type BlitzTankType = 'AT-SPG' | 'lightTank' | 'mediumTank' | 'heavyTank';
/**
 * Warning! This is not exhaustive.
 */
interface TankParameters {
  resourcesPath: {
    smallIconPath: string;
    bigIconPath: string;
    blitzModelPath: string;
  };
}

const blitzTankTypeToBlitzkrieg: Record<BlitzTankType, TankType> = {
  'AT-SPG': 'tank_destroyer',
  lightTank: 'light',
  mediumTank: 'medium',
  heavyTank: 'heavy',
};
const DATA =
  'C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz/Data';
const LANGUAGE = 'en';
const DOI = {
  vehicleDefinitions: 'XML/item_defs/vehicles',
  strings: 'Strings',
  tankParameters: '3d/Tanks/Parameters',
  smallIcons: 'Gfx/UI/BattleScreenHUD/SmallTankIcons',
  bigIcons: 'Gfx/UI/BigTankIcons',
  flags: 'Gfx/Lobby/flags',
  '3d': '3d',
};

const allTargets = argv.includes('--all-targets');
const targets = argv
  .find((argument) => argument.startsWith('--target'))
  ?.split('=')[1]
  .split(',');

if (!targets && !allTargets) throw new Error('No target(s) specified');

if (allTargets || targets?.includes('tankDefinitions')) {
  console.log('Building tank definitions...');

  const tankDefinitions: TankDefinitions = {};
  const nations = await readdir(`${DATA}/${DOI.vehicleDefinitions}`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );
  const strings = await readYAMLDVPL<Strings>(
    `${DATA}/${DOI.strings}/${LANGUAGE}.yaml.dvpl`,
  );

  await Promise.all(
    nations.map(async (nation) => {
      const tanks = await readXMLDVPL<VehicleDefinitionList>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/list.xml.dvpl`,
      );

      for (const tankIndex in tanks) {
        const tank = tanks[tankIndex];
        const nationVehicleId = tank.id;
        const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;
        const name = strings[tank.userString] ?? tankIndex;
        const name_short = tank.shortUserString
          ? strings[tank.shortUserString] === name
            ? undefined
            : strings[tank.shortUserString]
          : undefined;
        const isPremium =
          typeof tank.price === 'number' ? false : 'gold' in tank.price;
        const isCollector = tank.sellPrice ? 'gold' in tank.sellPrice : false;
        const tier = tank.level as Tier;
        const tags = tank.tags.split(' ');
        const type = blitzTankTypeToBlitzkrieg[tags[0] as BlitzTankType];
        const testing = tags.includes('testTank') ? true : undefined;

        if ((name ?? name_short) === undefined) {
          console.warn(`Missing name for ${tankIndex}`);
        }

        tankDefinitions[id] = {
          id,
          name,
          name_short,
          nation,
          tree_type: isCollector
            ? 'collector'
            : isPremium
              ? 'premium'
              : 'researchable',
          tier,
          type,
          testing,
        };
      }
    }),
  );

  console.log('Committing tank definitions...');
  await commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'tank definitions',
    [
      {
        content: JSON.stringify(tankDefinitions),
        encoding: 'utf-8',
        path: 'definitions/tanks.json',
      },
    ],
    true,
  );
}

if (
  allTargets ||
  targets?.includes('bigTankIcons') ||
  targets?.includes('smallTankIcons')
) {
  console.log('Building tank icons...');

  const changes: FileChange[] = [];
  const nations = await readdir(`${DATA}/${DOI.vehicleDefinitions}`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );

  await Promise.all(
    nations.map(async (nation) => {
      const tanks = await readXMLDVPL<VehicleDefinitionList>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/list.xml.dvpl`,
      );

      for (const tankIndex in tanks) {
        const tank = tanks[tankIndex];
        const nationVehicleId = tank.id;
        const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;
        const parameters = await readYAMLDVPL<TankParameters>(
          `${DATA}/${DOI.tankParameters}/${nation}/${tankIndex}.yaml.dvpl`,
        );
        const small = `${DATA}/${parameters.resourcesPath.smallIconPath
          .replace(/~res:\//, '')
          .replace(/\..+/, '')}.packed.webp.dvpl`;
        const big = `${DATA}/${parameters.resourcesPath.bigIconPath
          .replace(/~res:\//, '')
          .replace(/\..+/, '')}.packed.webp.dvpl`;

        if (allTargets || targets?.includes('bigTankIcons')) {
          changes.push({
            content: await readBase64DVPL(big),
            encoding: 'base64',
            path: `icons/big/${id}.webp`,
          });
        }
        if (allTargets || targets?.includes('smallTankIcons')) {
          changes.push({
            content: await readBase64DVPL(small),
            encoding: 'base64',
            path: `icons/small/${id}.webp`,
          });
        }
      }
    }),
  );

  console.log('Committing tank icons...');
  await commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'tank icons',
    changes,
    true,
  );
}

if (allTargets || targets?.includes('scratchedFlags')) {
  console.log('Building scratched flags...');

  const flags = await readdir(`${DATA}/${DOI.flags}`);

  console.log('Committing scratched flags...');
  commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'scratched flags',
    await Promise.all(
      flags
        .filter(
          (flag) =>
            flag.startsWith('flag_tutor-tank_') &&
            !flag.endsWith('@2x.packed.webp.dvpl'),
        )
        .map(async (flag) => {
          const content = await readBase64DVPL(`${DATA}/${DOI.flags}/${flag}`);
          const name = flag.match(/flag_tutor-tank_(.+)\.packed\.webp/)![1];

          return {
            content,
            encoding: 'base64',
            path: `flags/scratched/${name}.webp`,
          } satisfies FileChange;
        }),
    ),
    true,
  );
}

if (allTargets || targets?.includes('circleFlags')) {
  const flags = await readdir(`${DATA}/${DOI.flags}`);

  commitMultipleFiles(
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    'circle flags',
    await Promise.all(
      flags
        .filter(
          (flag) =>
            flag.startsWith('flag_profile-stat_') &&
            !flag.endsWith('@2x.packed.webp.dvpl'),
        )
        .map(async (flag) => {
          const content = await readBase64DVPL(`${DATA}/${DOI.flags}/${flag}`);
          const name = flag.match(/flag_profile-stat_(.+)\.packed\.webp/)![1];

          return {
            content,
            encoding: 'base64',
            path: `flags/circle/${name}.webp`,
          } satisfies FileChange;
        }),
    ),
    true,
  );
}

if (allTargets || targets?.includes('tankModels')) {
  console.log('Building tank models...');

  if (existsSync('dist/assets/models')) {
    await rm('dist/assets/models', { recursive: true });
  }
  await mkdir('dist/assets/models', { recursive: true });

  const changes: FileChange[] = [];
  const nations = await readdir(`${DATA}/${DOI.vehicleDefinitions}`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );

  await Promise.all(
    nations.map(async (nation) => {
      const tanks = await readXMLDVPL<VehicleDefinitionList>(
        `${DATA}/${DOI.vehicleDefinitions}/${nation}/list.xml.dvpl`,
      );

      for (const tankIndex in tanks) {
        const tank = tanks[tankIndex];
        const nationVehicleId = tank.id;
        const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;

        // if (id !== 817) continue;
        // console.log(`Building model ${id} @ ${nation}/${tankIndex}`);

        const parameters = await readYAMLDVPL<TankParameters>(
          `${DATA}/${DOI.tankParameters}/${nation}/${tankIndex}.yaml.dvpl`,
        );
        const sc2Path = parameters.resourcesPath.blitzModelPath;
        // const scgPath = parameters.resourcesPath.blitzModelPath.replace(
        //   /\.sc2$/,
        //   '.scg',
        // );
        const sc2Stream = await SCPGStream.fromDVPLFile(
          `${DATA}/${DOI['3d']}/${sc2Path}.dvpl`,
        );
        // const scgStream = await SCPGStream.fromDVPLFile(
        //   `${DATA}/${DOI['3d']}/${scgPath}.dvpl`,
        // );
        const sc2Data = sc2Stream.consumeSC2();
        // const scgData = scgStream.consumeSCG();

        // writeFile(
        //   `test.json`,
        //   JSON.stringify(sc2Data, (key, value) =>
        //     typeof value === 'bigint' ? value.toString() : value,
        //   ),
        // );
      }
    }),
  );

  // console.log('Committing tank icons...');
  // await commitMultipleFiles(
  //   'tresabhi',
  //   'blitzkrieg-assets',
  //   'main',
  //   'tank icons',
  //   changes,
  //   true,
  // );
}
