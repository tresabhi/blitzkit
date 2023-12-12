import { XMLParser } from 'fast-xml-parser';
import { readStringDVPL } from './readStringDVPL';

export async function readXMLDVPL<Type>(file: string) {
  const parser = new XMLParser();
  const xml = await readStringDVPL(file);

  return parser.parse(xml) as Type;
}
