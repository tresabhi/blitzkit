import { existsSync } from 'fs';
import { readDVPLFile } from '../blitz/readDVPLFile';
import { ToJpgOptions, toJpg } from './toJpg';

export async function readTexture(
  path: string,
  options?: Partial<Omit<ToJpgOptions, 'format'>>,
) {
  const ddsTexturePath = path.replace('.tex', '.dx11.dds.dvpl');
  const isDds = existsSync(ddsTexturePath);
  const resolvedTexturePath = isDds
    ? ddsTexturePath
    : ddsTexturePath.replace('.dds', '.pvr');
  const decompressedTexture = await readDVPLFile(resolvedTexturePath);
  const jpg = await toJpg(decompressedTexture, {
    ...options,
    format: isDds ? 'dds' : 'pvr',
  });

  return jpg;
}
