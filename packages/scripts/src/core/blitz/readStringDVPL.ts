import { readDVPLFile } from './readDVPLFile';

export async function readStringDVPL(file: string) {
  const buffer = await readDVPLFile(file);
  return buffer.toString();
}
