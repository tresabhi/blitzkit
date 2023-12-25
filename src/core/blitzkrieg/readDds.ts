import { readDVPLFile } from '../blitz/readDVPLFile';
import { PrimitiveStream } from '../streams/primitive';

export function readDds(buffer: Buffer) {
  const stream = new PrimitiveStream(buffer);
  const name = stream.consumeAscii(4);

  if (name !== 'DDS ') throw new TypeError('Not a DDS file');
}

readDds(
  await readDVPLFile(
    'C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz/Data/3d/Tanks/German/images_pbr/E_100_BC.dx11.dds.dvpl',
  ),
);
