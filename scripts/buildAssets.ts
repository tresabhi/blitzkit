import { Octokit } from '@octokit/rest';
import decompress from 'decompress';
import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { readFile, readdir, rm } from 'fs/promises';
import { load } from 'js-yaml';
import { argv, env } from 'process';
import { ElementCompact, xml2js } from 'xml-js';
import { parse } from 'yaml';
import { NATION_IDS } from '../src/constants/nations';
import {
  TankDefinitions,
  Tier,
} from '../src/core/blitzkrieg/definitions/tanks';
import commitMultipleFiles, { FileChange } from './commitMultipleFiles';

config();

const LANGUAGE = 'en';
const TEMP = 'temp/blitz';

const publish = argv.includes('--publish');
const apkFile = argv
  .find((argument) => argument.startsWith('--file'))
  ?.split('=')[1];
const noRewrite = argv.includes('--no-rewrite');

if (!apkFile) throw new Error('No file specified');

const directoriesOfInterest = {
  vehicleDefinitions: 'assets/Data/XML/item_defs/vehicles',
  strings: 'assets/Data/Strings',
  tankParameters: 'assets/Data/3d/Tanks/Parameters',
  smallIcons: 'assets/Data/Gfx/UI/BattleScreenHUD/SmallTankIcons',
  bigIcons: 'assets/Data/Gfx/UI/BigTankIcons',
  flags: 'assets/Data/Gfx/Lobby/flags',
};
const directoriesOfInterestArray = Object.values(directoriesOfInterest);

if (!noRewrite) {
  await rm(TEMP, { recursive: true, force: true });
  await decompress(apkFile, TEMP, {
    filter: (file) =>
      directoriesOfInterestArray.some((dir) => file.path.startsWith(dir)),
  });
}

const strings = await readFile(
  `${TEMP}/${directoriesOfInterest.strings}/${LANGUAGE}.yaml`,
  'utf-8',
).then((data) => load(data) as Record<string, string>);
const tankDefinitions: TankDefinitions = {};
const tankIds: number[] = [];
const images: Record<number, { big: string; small: string }> = {};
const nations = await readdir(
  `${TEMP}/${directoriesOfInterest.vehicleDefinitions}`,
);

writeFileSync('test.json', JSON.stringify(strings, null, 2));

Promise.all(
  nations
    .filter((nation) => nation !== 'common')
    .map(async (nation) => {
      const listXML = await readFile(
        `${TEMP}/${directoriesOfInterest.vehicleDefinitions}/${nation}/list.xml`,
        'utf-8',
      );
      const list = xml2js(listXML, { compact: true }) as ElementCompact;

      await Promise.all(
        Object.entries<ElementCompact>(list.root).map(
          async ([vehicle, vehicleData]) => {
            const nationVehicleId = parseInt(list.root[vehicle].id._text);
            const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;
            const name = strings[vehicleData.userString._text];
            const name_short = strings[vehicleData.shortUserString?._text];
            const isPremium = 'gold' in vehicleData.price;
            const isCollector = vehicleData.sellPrice
              ? 'gold' in vehicleData.sellPrice
              : false;
            const tier = parseInt(vehicleData.level._text) as Tier;
            const tags = vehicleData.tags._text.split(' ');
            const type = tags[0];

            if ((name ?? name_short) === undefined) {
              console.warn(`Missing name for ${vehicle}`);
            }

            tankIds.push(id);
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

            // Tank images
            const parameterPath = `${TEMP}/${directoriesOfInterest.tankParameters}/${nation}/${vehicle}.yaml`;
            const parameterString = await readFile(parameterPath, 'utf-8');
            const { smallIconPath, bigIconPath } =
              parse(parameterString).resourcesPath;
            images[id] = {
              small: `${TEMP}/assets/Data/${(smallIconPath as string)
                .replace(/~res:\//, '')
                .replace(/\..+/, '')}.packed.webp`,
              big: `${TEMP}/assets/Data/${(bigIconPath as string)
                .replace(/~res:\//, '')
                .replace(/\..+/, '')}.packed.webp`,
            };
          },
        ),
      );
    }),
).then(async () => {
  if (!publish) return;

  const octokit = new Octokit({ auth: env.GH_TOKEN });
  // const tankDefinitionsChange: FileChange = {
  //   content: JSON.stringify(tankDefinitions),
  //   path: 'definitions/tanks.json',
  //   encoding: 'utf-8',
  // };
  // const iconsChange = (
  //   await Promise.all(
  //     tankIds.map(async (id) => {
  //       try {
  //         const [contentSmall, contentBig] = await Promise.all([
  //           readFile(images[id].small, { encoding: 'base64' }),
  //           readFile(images[id].big, { encoding: 'base64' }),
  //         ]);

  //         return [
  //           {
  //             content: contentBig,
  //             path: `icons/big/${id}.webp`,
  //             encoding: 'base64',
  //           },
  //           {
  //             content: contentSmall,
  //             path: `icons/small/${id}.webp`,
  //             encoding: 'base64',
  //           },
  //         ];
  //       } catch (error) {
  //         console.log(error);
  //         return undefined;
  //       }
  //     }),
  //   )
  // ).flat() as FileChange[];
  const flags = await readdir(`${TEMP}/${directoriesOfInterest.flags}`);
  // const scratchedFlags = await Promise.all(
  //   flags
  //     .filter((flag) => flag.startsWith('flag_tutor-tank_'))
  //     .map(async (flag) => {
  //       const content = await readFile(
  //         `${TEMP}/${directoriesOfInterest.flags}/${flag}`,
  //         { encoding: 'base64' },
  //       );
  //       const name = flag.match(/flag_tutor-tank_(.+)\.packed\.webp/)![1];

  //       return {
  //         content,
  //         encoding: 'base64',
  //         path: `flags/scratched/${name}.webp`,
  //       } satisfies FileChange;
  //     }),
  // );
  const circleFlags = await Promise.all(
    flags
      .filter((flag) => flag.startsWith('flag_profile-stat_'))
      .map(async (flag) => {
        const content = await readFile(
          `${TEMP}/${directoriesOfInterest.flags}/${flag}`,
          { encoding: 'base64' },
        );
        const name = flag.match(/flag_profile-stat_(.+)\.packed\.webp/)![1];

        return {
          content,
          encoding: 'base64',
          path: `flags/circle/${name}.webp`,
        } satisfies FileChange;
      }),
  );

  console.log('Writing files...');
  await commitMultipleFiles(
    octokit,
    'tresabhi',
    'blitzkrieg-assets',
    'main',
    new Date().toString(),
    circleFlags,
    true,
  );
});
