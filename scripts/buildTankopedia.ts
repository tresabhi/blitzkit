import decompress from 'decompress';
import { readFile, readdir, rm, writeFile } from 'fs/promises';
import { load } from 'js-yaml';
import { ElementCompact, xml2js } from 'xml-js';
import { NATION_IDS } from '../src/constants/nations';

const REWRITE = false;
const VEHICLE_DEFS = 'assets/Data/XML/item_defs/vehicles';
const APK_FILE = 'temp/blitz.apk';
const STRINGS = 'assets/Data/Strings';
const LANGUAGE = 'en';
const DIRECTORIES_OF_INTEREST = [VEHICLE_DEFS, STRINGS];

if (REWRITE) {
  await rm('temp/blitz', { recursive: true, force: true });
  decompress(APK_FILE, 'temp/blitz', {
    filter: (file) =>
      DIRECTORIES_OF_INTEREST.some((dir) => file.path.startsWith(dir)),
  });
}

interface BlitzkriegTankopedia {
  id: number;
  nation: string;
  name: string;
  name_short?: string;
  is_premium: boolean;
  is_collector: boolean;
  tier: number;
  type: string;
}

const strings = await readFile(
  `temp/blitz/${STRINGS}/${LANGUAGE}.yaml`,
  'utf-8',
).then((data) => load(data) as Record<string, string>);
const tankopedia: Record<number, BlitzkriegTankopedia> = {};
const nations = await readdir(`temp/blitz/${VEHICLE_DEFS}`);

await Promise.all(
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
            // const vehicleXML = await readFile(
            //   `temp/blitz/${VEHICLE_DEFS}/${nation}/${vehicle}.xml`,
            //   'utf-8',
            // ).then((xml) => xml2js(xml, { compact: true }) as ElementCompact);
            const nationVehicleId = parseInt(list.root[vehicle].id._text);
            const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;
            // TODO: use userString property instead
            const name = strings[`#${nation}_vehicles:${vehicle}`];
            const name_short = strings[`#${nation}_vehicles:${vehicle}_short`];
            const is_premium = 'gold' in vehicleData.price;
            const is_collector = vehicleData.sellPrice
              ? 'gold' in vehicleData.sellPrice
              : false;
            const tier = parseInt(vehicleData.level._text);
            const tags = vehicleData.tags._text.split(' ');
            const type = tags[0];

            tankopedia[id] = {
              id,
              name,
              name_short,
              nation,
              is_premium,
              is_collector,
              tier,
              type,
            };
          },
        ),
      );
    }),
);

writeFile('dist/tankopedia.json', JSON.stringify(tankopedia, null, 2));
