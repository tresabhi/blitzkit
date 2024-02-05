import { encode } from 'lz4';
import { BkonWriteStream } from '../streams/bkon';

export function superCompress(object: any) {
  const write = new BkonWriteStream().bkon(object);
  const compressed = encode(write.buffer);
  return compressed.toString('base64');
}
