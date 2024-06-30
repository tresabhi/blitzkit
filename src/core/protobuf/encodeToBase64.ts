import { encode } from './encode';

export async function encodeToBase64(proto: string, data: any) {
  const array = await encode(proto, data);
  return Buffer.from(array).toString('base64');
}
