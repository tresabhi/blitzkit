import { decompress } from 'lz4js';
import { CdonReadStream } from '../streams/cdon';

export function superDecompress<Type>(buffer: ArrayBuffer) {
  const decompressed = decompress(new Uint8Array(buffer)).buffer;
  const read = new CdonReadStream(decompressed);
  return read.cdon() as Type;
}
