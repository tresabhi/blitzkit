import { readdir } from 'fs/promises';
import { google } from 'googleapis';
import { cloneDeep, uniqBy } from 'lodash';
import { parse as parseYaml } from 'yaml';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import { toUniqueId } from '../../src/core/blitz/toUniqueId';
import { commitAssets } from '../../src/core/blitzkit/commitAssets';
import { VideoDefinitions } from '../../src/core/blitzkit/videos';
import { DATA, POI } from './constants';
import { BlitzStrings, botPattern, VehicleDefinitionList } from './definitions';

const youtubers = [
  'UCKBYXp4Xn2I2tL1UL4fpbhw', // droodles
  'UCrQ-Dy8lVsm11u8pCJ8W7Tw', // fatness
];

export async function videos(production: boolean) {
  console.log('Building videos...');

  const currentVideos = await fetch(
    'https://raw.githubusercontent.com/tresabhi/blitzkit-assets/main/definitions/videos.csv',
  )
    .then((response) => response.text())
    .then((lines) => {
      return lines
        .split('\n')
        .map((line) => {
          const [idString, lastUpdatedString, ...videos] = line.split(',');
          const id = Number(idString);
          const lastUpdated = Number(lastUpdatedString);
          return { id, lastUpdated, videos };
        })
        .reduce<VideoDefinitions>(
          (accumulator, { id, lastUpdated, videos }) => {
            accumulator[id] = { lastUpdated, videos };
            return accumulator;
          },
          {},
        );
    });
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
  });
  const youtube = google.youtube({ version: 'v3', auth });

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
  const tanks: { id: number; name: string; tier: number }[] = [];
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
          const tier = tank.level;

          tanks.push({ id, name, tier });
        }),
      );
    }),
  );

  const tanksSanitized = tanks
    .sort((a, b) => b.tier - a.tier)
    .sort((a, b) => {
      const lastUpdatedA = currentVideos[a.id]?.lastUpdated ?? 0;
      const lastUpdatedB = currentVideos[b.id]?.lastUpdated ?? 0;
      return lastUpdatedA - lastUpdatedB;
    });
  const videos: VideoDefinitions = cloneDeep(currentVideos);

  let done = 0;
  for (const tank of tanksSanitized) {
    try {
      const results = await youtube.search.list({
        part: ['snippet'],
        q: `World of Tanks Blitz ${tank.name}`,
      });

      if (!results.data.items || results.data.items.length === 0) continue;

      const items = uniqBy(
        results.data.items.filter(
          (item) =>
            item.snippet?.channelId &&
            item.id?.videoId &&
            youtubers.includes(item.snippet.channelId),
        ),
        (item) => item.snippet!.channelId,
      );

      videos[tank.id] = {
        lastUpdated: Math.round(Date.now() / 1000),
        videos: items.map((item) => item.id!.videoId!),
      };

      console.log(
        `${++done} / ${tanks.length} (${Math.round(100 * (done / tanks.length))}%) done; found ${items.length} for ${tank.name}`,
      );

      await new Promise((resolve) => setTimeout(resolve, 1000 / 5));
    } catch (error) {
      console.warn('An error occurred, safely exiting prematurely...', error);
      break;
    }
  }

  const content = Object.entries(videos)
    .map(
      ([id, { videos, lastUpdated }]) =>
        `${id},${lastUpdated},${videos.join(',')}`,
    )
    .join('\n');

  return;
  await commitAssets(
    'videos',
    [{ content, encoding: 'utf-8', path: 'definitions/videos.csv' }],
    production,
  );
}
