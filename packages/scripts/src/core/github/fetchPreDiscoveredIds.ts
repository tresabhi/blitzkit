import {
  asset,
  DidsReadStream,
  DiscoveredIdsDefinitions,
} from '@blitzkit/core';
import { times } from 'lodash';
import { decompress } from 'lz4js';
import ProgressBar from 'progress';

export async function fetchPreDiscoveredIds() {
  const idChunks: number[][] = [];
  const manifest = (await fetch(asset('ids/manifest.json')).then((response) =>
    response.json(),
  )) as DiscoveredIdsDefinitions;
  const bar = new ProgressBar(
    `Fetching ${manifest.count.toLocaleString()} ids in ${
      manifest.chunks
    } chunks :bar`,
    manifest.chunks,
  );

  bar.render();
  await Promise.all(
    times(manifest.chunks, async (chunkIndex) => {
      const preDiscovered = await fetch(
        asset(`ids/${chunkIndex}.dids.lz4`),
      ).then(async (response) => {
        const buffer = await response.arrayBuffer();
        const decompressed = decompress(new Uint8Array(buffer)).buffer;
        return new DidsReadStream(decompressed as ArrayBuffer).dids();
      });

      idChunks.push(preDiscovered);
      bar.tick();
    }),
  );

  return idChunks.sort((a, b) => a[0] - b[0]).flat();
}
