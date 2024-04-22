import { readdir } from 'fs/promises';
import { google } from 'googleapis';
import { parse as parseYaml } from 'yaml';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import { toUniqueId } from '../../src/core/blitz/toUniqueId';
import { commitAssets } from '../../src/core/blitzkrieg/commitAssets';
import { DATA, POI } from './constants';
import { BlitzStrings, botPattern, VehicleDefinitionList } from './definitions';

const youtubers = [
  'UCKBYXp4Xn2I2tL1UL4fpbhw', // droodles
  'UCrQ-Dy8lVsm11u8pCJ8W7Tw', // fatness
];

export async function videos(production: boolean) {
  console.log('Building videos...');

  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
  });
  const youtube = google.youtube({ version: 'v3', auth });

  async function search(channel: string, search: string) {
    (
      await youtube.search.list({
        channelId: channel,
        maxResults: 1,
        part: ['snippet'],
        q: search,
      })
    ).data.items?.at(0)?.id ?? null;
  }

  const nations = await readdir(`${DATA}/${POI.vehicleDefinitions}`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );
  const stringsPreInstalled = await readYAMLDVPL<BlitzStrings>(
    `${DATA}/${POI.strings}/en.yaml.dvpl`,
  );
  const stringsCache = await fetch(POI.cachedStrings)
    .then((response) => response.text())
    .then((string) => parseYaml(string) as BlitzStrings);
  const strings = {
    ...stringsPreInstalled,
    ...stringsCache,
  };
  const tanks: { id: number; name: string }[] = [];
  await Promise.all(
    nations.map(async (nation) => {
      const tankList = await readXMLDVPL<{ root: VehicleDefinitionList }>(
        `${DATA}/${POI.vehicleDefinitions}/${nation}/list.xml.dvpl`,
      );

      await Promise.all(
        Object.entries(tankList.root).map(async ([tankKey, tank]) => {
          if (botPattern.test(tankKey)) return null;

          const id = toUniqueId(nation, tank.id);
          const name =
            (tank.shortUserString
              ? strings[tank.shortUserString]
              : undefined) ?? strings[tank.userString];

          tanks.push({ id, name });
        }),
      );
    }),
  );

  let content = '';
  let done = 0;
  for (const tank of tanks) {
    const results = await Promise.all(
      youtubers.map((channel) => search(channel, tank.name)),
    ).then((results) => results.filter((result) => result !== null));

    if (results.length === 0) continue;

    const line = `${tank.id},${results.join(',')}`;
    content += `${line}\n`;
    console.log(`${++done} / ${tanks.length} done`, tank.name, line);

    await new Promise((resolve) =>
      setTimeout(resolve, (1000 / 5) * youtubers.length),
    );
  }

  console.log(content);

  await commitAssets(
    'videos',
    [{ content, encoding: 'utf-8', path: 'definitions/videos.csv' }],
    production,
  );
}
