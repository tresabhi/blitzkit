import { readDVPL } from './readDVPL';

export async function readStringDVPL(file: string) {
  const buffer = await readDVPL(file);
  return buffer.toString();
}
