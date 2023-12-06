import { readDVPL } from './readDVPL';

export async function readBase64DVPL(file: string) {
  const buffer = await readDVPL(file);
  return buffer.toString('base64');
}
