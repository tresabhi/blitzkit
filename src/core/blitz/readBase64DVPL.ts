import { readDVPLFile } from './readDVPLFile';

export async function readBase64DVPL(file: string) {
  const buffer = await readDVPLFile(file);
  return buffer.toString('base64');
}
