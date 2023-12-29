import sharp from 'sharp';
import { readDVPLFile } from '../blitz/readDVPLFile';
import { DdsStream } from '../streams/dds';

export async function readTexture(path: string) {
  const ddsTexturePath = path.replace('.tex', '.dx11.dds.dvpl');
  const decompressedDvpl = await readDVPLFile(ddsTexturePath);
  const stream = new DdsStream(decompressedDvpl);
  const ddsRaw = await stream.dds();

  return await sharp(ddsRaw.data, { raw: ddsRaw }).png().toBuffer();

  // const isDds = existsSync(ddsTexturePath);
  // const resolvedTexturePath = isDds
  //   ? ddsTexturePath
  //   : ddsTexturePath.replace('.dds', '.pvr');
  // const decompressedTexture = await readDVPLFile(resolvedTexturePath);
  // const jpg = await toJpg(decompressedTexture, {
  //   ...options,
  //   format: isDds ? 'dds' : 'pvr',
  // });

  // return jpg;
}
