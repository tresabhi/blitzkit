import { readFile } from 'fs/promises';
import { parse } from 'yaml';

export async function readYAML<Type>(file: string) {
  const yaml = (await readFile(file)).toString();
  return parse(yaml) as Type;
}
