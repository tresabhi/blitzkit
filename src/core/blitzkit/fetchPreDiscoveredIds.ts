import { times } from 'lodash';
import { decompress } from 'lz4js';
import ProgressBar from 'progress';
import { DiscoverIdsManifest } from '../../../scripts/discoverIds';
import { DidsReadStream } from '../streams/dids';
import { asset } from './asset';

export async function fetchPreDiscoveredIds(dev: boolean) {
  const idChunks: number[][] = [];
  const manifest = (await fetch(asset('ids/manifest.json', dev)).then(
    (response) => response.json(),
  )) as DiscoverIdsManifest;
  const bar = new ProgressBar(
    `Fetching ${manifest.count.toLocaleString()} ids in ${manifest.chunks} chunks :bar`,
    manifest.chunks,
  );

  bar.render();
  await Promise.all(
    times(manifest.chunks, async (chunkIndex) => {
      const preDiscovered = await fetch(
        asset(`ids/${chunkIndex}.dids.lz4`, dev),
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
