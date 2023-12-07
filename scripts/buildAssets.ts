import { config } from 'dotenv';
import { readFile, readdir } from 'fs/promises';
import { argv } from 'process';
import { TankType } from '../src/components/Tanks';
import { NATION_IDS } from '../src/constants/nations';
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

class SCGStream {
  public index = 0;

  constructor(public buffer: Buffer) {}

  consume(size: number) {
    const subarray = this.buffer.subarray(this.index, this.index + size);
    this.index += size;

    return subarray;
  }

  consumeAscii(size: number) {
    return this.consume(size).toString('ascii');
  }

  consumeByteArray(size: number) {
    return this.consume(size);
  }

  consumeInt8() {
    return this.consume(1).readInt8();
  }
  consumeInt16() {
    return this.consume(2).readInt16LE();
  }
  consumeInt32() {
    return this.consume(4).readInt32LE();
  }

  consumeSCGHeader() {
    return {
      name: this.consumeAscii(4),
      version: this.consumeInt32(),
      nodeCount: this.consumeInt32(),
      nodeCount2: this.consumeInt32(),
    };
  }

  consumeKAHeader() {
    return {
      name: this.consumeAscii(2),
      version: this.consumeInt16(),
      count: this.consumeInt32(),
    };
  }

  consumeKA() {
    const type = this.consumeInt8();

    if (type === 2) {
      // int32
      return { type, value: this.consumeInt32() };
    } else if (type === 4) {
      // string
      const length = this.consumeInt32();
      const value = this.consumeAscii(length);

      return { type, length, value };
    } else if (type === 6) {
      // byte array
      const length = this.consumeInt32();
      const value = this.consumeByteArray(length);

      return { type, length, value };
    }
    {
      throw new TypeError(`Unknown KA type: ${type}`);
    }
  }

  consumeRemaining() {
    return this.consume(Number.POSITIVE_INFINITY);
  }

  skip(size: number) {
    this.index += size;
  }
}

async function readSCG(file: string) {
  const stream = new SCGStream(await readFile(file));

  const header = stream.consumeSCGHeader();

  for (let i = 0; i < header.nodeCount; i++) {
    const ka = stream.consumeKAHeader();

    for (let KAIndex = 0; KAIndex < ka.count; KAIndex++) {
      console.log(stream.consumeKA());
    }
  }
}

await readSCG('test.scg');

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
