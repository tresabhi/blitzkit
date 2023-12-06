import { Octokit } from '@octokit/rest';
import { config } from 'dotenv';
import { readdir } from 'fs/promises';
import { argv, env } from 'process';
import { TankType } from '../src/components/Tanks';
import { NATION_IDS } from '../src/constants/nations';
import { readXMLDVPL } from '../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../src/core/blitz/readYAMLDVPL';
import commitMultipleFiles from '../src/core/blitzkrieg/commitMultipleFiles';
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
};

const octokit = new Octokit({ auth: env.GH_TOKEN });
const targets = argv
  .find((argument) => argument.startsWith('--target'))
  ?.split('=')[1]
  .split(',');

if (!targets) throw new Error('No target(s) specified');

if (targets.includes('tankDefinitions')) {
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
        const name = strings[tank.userString];
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
        };
      }
    }),
  );

  console.log('Committing tank definitions...');
  await commitMultipleFiles(
    octokit,
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

// console.log(
//   (
//     await readDVPL(
//       `${DATA}/${DOI.strings}/${LANGUAGE}.yaml.dvpl`,
//     )
//   ).toString(),
// );

// const strings = await readFile(
//   `${DATA}/${DOI.strings}/${LANGUAGE}.yaml.dvpl`,
//   'utf-8',
// ).then((data) => load(data) as Record<string, string>);

// const tankDefinitions: TankDefinitions = {};
// const tankIds: number[] = [];
// const images: Record<number, { big: string; small: string }> = {};
// const nations = await readdir(
//   `${TEMP}/${DOI.vehicleDefinitions}`,
// );

// writeFileSync('test.json', JSON.stringify(strings, null, 2));

// Promise.all(
//   nations
//     .filter((nation) => nation !== 'common')
//     .map(async (nation) => {
//       const listXML = await readFile(
//         `${TEMP}/${DOI.vehicleDefinitions}/${nation}/list.xml`,
//         'utf-8',
//       );
//       const list = xml2js(listXML, { compact: true }) as ElementCompact;

//       await Promise.all(
//         Object.entries<ElementCompact>(list.root).map(
//           async ([vehicle, vehicleData]) => {
//             const nationVehicleId = parseInt(list.root[vehicle].id._text);
//             const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;
//             const name = strings[vehicleData.userString._text];
//             const name_short = strings[vehicleData.shortUserString?._text];
//             const isPremium = 'gold' in vehicleData.price;
//             const isCollector = vehicleData.sellPrice
//               ? 'gold' in vehicleData.sellPrice
//               : false;
//             const tier = parseInt(vehicleData.level._text) as Tier;
//             const tags = vehicleData.tags._text.split(' ');
//             const type = tags[0];

//             if ((name ?? name_short) === undefined) {
//               console.warn(`Missing name for ${vehicle}`);
//             }

//             tankIds.push(id);
//             tankDefinitions[id] = {
//               id,
//               name,
//               name_short,
//               nation,
//               tree_type: isCollector
//                 ? 'collector'
//                 : isPremium
//                   ? 'premium'
//                   : 'researchable',
//               tier,
//               type,
//             };

//             // Tank images
//             const parameterPath = `${TEMP}/${DOI.tankParameters}/${nation}/${vehicle}.yaml`;
//             const parameterString = await readFile(parameterPath, 'utf-8');
//             const { smallIconPath, bigIconPath } =
//               parse(parameterString).resourcesPath;
//             images[id] = {
//               small: `${TEMP}/assets/Data/${(smallIconPath as string)
//                 .replace(/~res:\//, '')
//                 .replace(/\..+/, '')}.packed.webp`,
//               big: `${TEMP}/assets/Data/${(bigIconPath as string)
//                 .replace(/~res:\//, '')
//                 .replace(/\..+/, '')}.packed.webp`,
//             };
//           },
//         ),
//       );
//     }),
// ).then(async () => {
//   if (!publish) return;

//   const octokit = new Octokit({ auth: env.GH_TOKEN });
//   // const tankDefinitionsChange: FileChange = {
//   //   content: JSON.stringify(tankDefinitions),
//   //   path: 'definitions/tanks.json',
//   //   encoding: 'utf-8',
//   // };
//   // const iconsChange = (
//   //   await Promise.all(
//   //     tankIds.map(async (id) => {
//   //       try {
//   //         const [contentSmall, contentBig] = await Promise.all([
//   //           readFile(images[id].small, { encoding: 'base64' }),
//   //           readFile(images[id].big, { encoding: 'base64' }),
//   //         ]);

//   //         return [
//   //           {
//   //             content: contentBig,
//   //             path: `icons/big/${id}.webp`,
//   //             encoding: 'base64',
//   //           },
//   //           {
//   //             content: contentSmall,
//   //             path: `icons/small/${id}.webp`,
//   //             encoding: 'base64',
//   //           },
//   //         ];
//   //       } catch (error) {
//   //         console.log(error);
//   //         return undefined;
//   //       }
//   //     }),
//   //   )
//   // ).flat() as FileChange[];
//   const flags = await readdir(`${TEMP}/${DOI.flags}`);
//   // const scratchedFlags = await Promise.all(
//   //   flags
//   //     .filter((flag) => flag.startsWith('flag_tutor-tank_'))
//   //     .map(async (flag) => {
//   //       const content = await readFile(
//   //         `${TEMP}/${DOI.flags}/${flag}`,
//   //         { encoding: 'base64' },
//   //       );
//   //       const name = flag.match(/flag_tutor-tank_(.+)\.packed\.webp/)![1];

//   //       return {
//   //         content,
//   //         encoding: 'base64',
//   //         path: `flags/scratched/${name}.webp`,
//   //       } satisfies FileChange;
//   //     }),
//   // );
//   const circleFlags = await Promise.all(
//     flags
//       .filter((flag) => flag.startsWith('flag_profile-stat_'))
//       .map(async (flag) => {
//         const content = await readFile(
//           `${TEMP}/${DOI.flags}/${flag}`,
//           { encoding: 'base64' },
//         );
//         const name = flag.match(/flag_profile-stat_(.+)\.packed\.webp/)![1];

//         return {
//           content,
//           encoding: 'base64',
//           path: `flags/circle/${name}.webp`,
//         } satisfies FileChange;
//       }),
//   );

//   console.log('Writing files...');
//   await commitMultipleFiles(
//     octokit,
//     'tresabhi',
//     'blitzkrieg-assets',
//     'main',
//     new Date().toString(),
//     circleFlags,
//     true,
//   );
// });
