import { decompress } from 'lz4js';
import { BkonReadStream } from '../streams/bkon';

export function superDecompress<Type>(buffer: Buffer) {
  const decompressed = Buffer.from(decompress(buffer));
  const read = new BkonReadStream(decompressed);
  return read.bkon() as Type;
}
