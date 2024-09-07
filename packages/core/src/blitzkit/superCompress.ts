import { compress } from 'lz4js';
import { CdonWriteStream } from '../../../../src/core/streams/cdon';

export function superCompress(object: any) {
  const write = new CdonWriteStream().cdon(object);
  const compressed = compress(write.uint8Array);
  return Buffer.from(compressed).toString('base64');
}
