import {
  asset,
  decodeProtobuf,
  encodeProtobufToBase64,
  Reviews,
  toUniqueId,
  Video,
  youtubers,
} from '@blitzkit/core';
import { readdir } from 'fs/promises';
import { google } from 'googleapis';
import { cloneDeep, uniqBy } from 'lodash-es';
import { parse as parseYaml } from 'yaml';
import { DATA } from './buildAssets/constants';
import {
  BlitzStrings,
  botPattern,
  VehicleDefinitionList,
} from './buildAssets/definitions';
import { readXMLDVPL } from './core/blitz/readXMLDVPL';
import { readYAMLDVPL } from './core/blitz/readYAMLDVPL';
import { commitAssets } from './core/github/commitAssets';

const MAX_QUERIES = 128;

console.log('Finding reviews...');

const currentReviews = await fetch(asset('definitions/reviews.pb'))
  .then((response) => response.arrayBuffer())
  .then((buffer) =>
    decodeProtobuf<Reviews>(
      'reviews',
      'blitzkit.Reviews',
      new Uint8Array(buffer),
    ),
  );
const auth = await google.auth.getClient({
  scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
});
const youtube = google.youtube({ version: 'v3', auth });

const nations = await readdir(`${DATA}/XML/item_defs/vehicles`).then(
  (nations) => nations.filter((nation) => nation !== 'common'),
);
const stringsPreInstalled = await readYAMLDVPL<BlitzStrings>(
  `${DATA}/Strings/en.yaml.dvpl`,
);
const stringsCache = await fetch(
  'https://stufficons.wgcdn.co/localizations/en.yaml',
)
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
      `${DATA}/XML/item_defs/vehicles/${nation}/list.xml.dvpl`,
    );

    await Promise.all(
      Object.entries(tankList.root).map(async ([tankKey, tank]) => {
        if (botPattern.test(tankKey)) return null;

        const id = toUniqueId(nation, tank.id);
        const name =
          (tank.shortUserString ? strings[tank.shortUserString] : undefined) ??
          strings[tank.userString];
        const tier = tank.level;

        tanks.push({ id, name, tier });
      }),
    );
  }),
);

const tanksSanitized = tanks
  .sort((a, b) => b.tier - a.tier)
  .sort((a, b) => {
    const lastUpdatedA = currentReviews.reviews[a.id]?.last_updated ?? 0;
    const lastUpdatedB = currentReviews.reviews[b.id]?.last_updated ?? 0;
    return lastUpdatedA - lastUpdatedB;
  });
const reviews: Reviews = cloneDeep(currentReviews);

let done = 0;
for (const tank of tanksSanitized) {
  if (done >= MAX_QUERIES) {
    console.log(`Limit reached with ${done} queries; stopping...`);
    break;
  }

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
          youtubers.some(({ id }) => id === item.snippet?.channelId),
      ),
      (item) => item.snippet!.channelId,
    );

    reviews.reviews[tank.id] = {
      last_updated: Date.now(),
      videos: items.map(
        (item) =>
          ({
            id: item.id!.videoId!,
            author: item.snippet!.channelId!,
          }) satisfies Video,
      ),
    };

    console.log(`${++done} done; found ${items.length} for ${tank.name}`);

    await new Promise((resolve) => setTimeout(resolve, 1000 / 5));
  } catch (error) {
    console.warn(`Limit reached with ${done} queries`);
    break;
  }
}

const content = await encodeProtobufToBase64(
  'reviews',
  'blitzkit.Reviews',
  reviews,
);

await commitAssets('reviews', [
  { content, encoding: 'base64', path: 'definitions/reviews.pb' },
]);
