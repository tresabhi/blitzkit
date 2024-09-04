import { encode } from './encode';
import { ProtoSource } from './lookup';

export async function encodeToBase64(
  source: ProtoSource,
  type: string,
  data: any,
) {
  const array = encode(source, type, data);
  return Buffer.from(array).toString('base64');
}
