import { readFile } from 'fs/promises';
import { readDVPL } from './readDVPL';

export async function readDVPLFile(file: string) {
  return readDVPL(await readFile(file));
}
