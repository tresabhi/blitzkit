import { readFile } from 'fs/promises';
import { DATA_COMPRESSED } from '../../buildAssets/constants';
import { readDVPL } from './readDVPL';

export async function readDVPLFile(file: string) {
  if (DATA_COMPRESSED) {
    return readDVPL(await readFile(`${file}.dvpl`));
  }

  return readFile(file);
}
