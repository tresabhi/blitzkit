import { readFile } from 'fs/promises';
import { DATA_COMPRESSED } from '../../buildAssets/constants';
import { readDVPL } from './readDVPL';

export async function readDVPLFile(file: string) {
  let path: string;

  if (DATA_COMPRESSED) {
    path = file.endsWith('.dvpl') ? file : `${file}.dvpl`;
  } else {
    path = file.replace('.dvpl', '');
  }

  const content = await readFile(path);

  if (!DATA_COMPRESSED) return content;

  const dvpl = readDVPL(content);

  return dvpl;
}
