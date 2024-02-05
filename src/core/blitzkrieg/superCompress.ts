import { compress } from 'lz4js';
import { BkonWriteStream } from '../streams/bkon';

export function superCompress(object: any) {
  const write = new BkonWriteStream().bkon(object);
  const compressed = compress(write.buffer);
  return Buffer.from(compressed).toString('base64');
}
