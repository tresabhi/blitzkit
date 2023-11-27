import { Octokit } from '@octokit/rest';
import decompress from 'decompress';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'fs/promises';
import { load } from 'js-yaml';
import { argv, env } from 'process';
import { ElementCompact, xml2js } from 'xml-js';
import { parse } from 'yaml';
import { TreeTypeString } from '../src/components/Tanks';
import { NATION_IDS } from '../src/constants/nations';
import commitMultipleFiles, { FileChange } from './commitMultipleFiles';

const publish = argv.includes('--publish');
const apkFile = argv
  .find((argument) => argument.startsWith('--file'))
  ?.split('=')[1];
const noRewrite = argv.includes('--no-rewrite');

const VEHICLE_DEFS = 'assets/Data/XML/item_defs/vehicles';
const STRINGS = 'assets/Data/Strings';
const LANGUAGE = 'en';
const TANK_PARAMETERS = 'assets/Data/3d/Tanks/Parameters';
const SMALL_ICONS = 'assets/Data/Gfx/UI/BattleScreenHUD/SmallTankIcons';
const BIG_ICONS = 'assets/Data/Gfx/UI/BigTankIcons';
const DIRECTORIES_OF_INTEREST = [
  VEHICLE_DEFS,
  STRINGS,
  TANK_PARAMETERS,
  SMALL_ICONS,
  BIG_ICONS,
];

if (!apkFile) throw new Error('No file specified');

console.log('Removing old tankopedia files...');
await rm('dist/tankopedia', { recursive: true, force: true });
if (!noRewrite) {
  console.log('Removing old temp files...');
  await rm('temp/blitz', { recursive: true, force: true });

  console.log('Extracting Blitz files...');
  await decompress(apkFile, 'temp/blitz', {
    filter: (file) =>
      DIRECTORIES_OF_INTEREST.some((dir) => file.path.startsWith(dir)),
  });
}

console.log('Creating new tankopedia folder');
await mkdir('dist/tankopedia');

interface BlitzkriegTankopedia {
  id: number;
  nation: string;
  name: string;
  name_short?: string;
  tree_type: TreeTypeString;
  tier: number;
  type: string;
}

const strings = await readFile(
  `temp/blitz/${STRINGS}/${LANGUAGE}.yaml`,
  'utf-8',
).then((data) => load(data) as Record<string, string>);
const tankopedia: Record<number, BlitzkriegTankopedia> = {};
const tankIds: number[] = [];
const images: Record<number, { big: string; small: string }> = {};
const nations = await readdir(`temp/blitz/${VEHICLE_DEFS}`);

Promise.all(
  nations
    .filter((nation) => nation !== 'common')
    .map(async (nation) => {
      const listXML = await readFile(
        `temp/blitz/${VEHICLE_DEFS}/${nation}/list.xml`,
        'utf-8',
      );
      const list = xml2js(listXML, { compact: true }) as ElementCompact;

      await Promise.all(
        Object.entries<ElementCompact>(list.root).map(
          async ([vehicle, vehicleData]) => {
            // Tankopedia
            const nationVehicleId = parseInt(list.root[vehicle].id._text);
            const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;
            // TODO: use userString property instead
            const name = strings[`#${nation}_vehicles:${vehicle}`];
            const name_short = strings[`#${nation}_vehicles:${vehicle}_short`];
            const isPremium = 'gold' in vehicleData.price;
            const isCollector = vehicleData.sellPrice
              ? 'gold' in vehicleData.sellPrice
              : false;
            const tier = parseInt(vehicleData.level._text);
            const tags = vehicleData.tags._text.split(' ');
            const type = tags[0];

            tankIds.push(id);
            tankopedia[id] = {
              id,
              name,
              name_short,
              nation,
              tree_type: isCollector
                ? 'collector'
                : isPremium
                ? 'premium'
                : 'tech-tree',
              tier,
              type,
            };

            // Tank images
            const parameterPath = `temp/blitz/${TANK_PARAMETERS}/${nation}/${vehicle}.yaml`;
            const parameterString = await readFile(parameterPath, 'utf-8');
            const { smallIconPath, bigIconPath } =
              parse(parameterString).resourcesPath;
            images[id] = {
              small: `temp/blitz/assets/Data/${(smallIconPath as string)
                .replace(/~res:\//, '')
                .replace(/\..+/, '')}.packed.webp`,
              big: `temp/blitz/assets/Data/${(bigIconPath as string)
                .replace(/~res:\//, '')
                .replace(/\..+/, '')}.packed.webp`,
            };

            if (!publish) {
              cp(images[id].small, `dist/tankopedia/icons/small/${id}.webp`);
              cp(images[id].big, `dist/tankopedia/icons/big/${id}.webp`);
            }
          },
        ),
      );
    }),
).then(async () => {
  if (publish) {
    const octokit = new Octokit({ auth: env.GH_TOKEN });

    // console.log('Writing tankopedia.json');
    // commitMultipleFiles(
    //   octokit,
    //   'tresabhi',
    //   'blitzkrieg-assets',
    //   'main',
    //   new Date().toString(),
    //   [
    //     {
    //       content: JSON.stringify(tankopedia),
    //       path: 'tankopedia.json',
    //       encoding: 'utf-8',
    //     },
    //   ],
    // );

    console.log('Writing big icons...');
    await commitMultipleFiles(
      octokit,
      'tresabhi',
      'blitzkrieg-assets',
      'main',
      new Date().toString(),
      (await Promise.all(
        tankIds.map(async (id) => {
          try {
            const content = await readFile(images[id].big, {
              encoding: 'base64',
            });

            return {
              content,
              path: `icons/big/${id}.webp`,
              encoding: 'base64',
            };
          } catch (error) {
            console.log(error);
            return undefined;
          }
        }),
      )) as FileChange[],
    );
  } else {
    writeFile(
      'dist/tankopedia/tankopedia.json',
      JSON.stringify(tankopedia, null, 2),
    );
  }
});
