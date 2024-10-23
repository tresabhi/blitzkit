import { parse } from 'yaml';
import { readStringDVPL } from './readStringDVPL';

export async function readYAMLDVPL<Type>(file: string) {
  const yaml = await readStringDVPL(file);

  return parse(yaml) as Type;
}
