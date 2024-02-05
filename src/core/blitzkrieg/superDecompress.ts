import { decode } from 'lz4';
import { BkonReadStream } from '../streams/bkon';

export function superDecompress<Type>(buffer: Buffer) {
  const decompressed = decode(buffer);
  const read = new BkonReadStream(decompressed);
  return read.bkon() as Type;
}
