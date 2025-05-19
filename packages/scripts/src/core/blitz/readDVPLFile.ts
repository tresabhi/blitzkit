import { readFile } from 'fs/promises';
import { readDVPL } from './readDVPL';

export async function readDVPLFile(file: string) {
  const path = `${file}${file.endsWith('.dvpl') ? '' : '.dvpl'}`;
  const content = await readFile(path);
  const dvpl = readDVPL(content);

  return dvpl;
}
