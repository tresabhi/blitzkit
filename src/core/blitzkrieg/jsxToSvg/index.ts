import { readFileSync } from 'fs';
import satori from 'satori';

const fonts = [
  {
    data: readFileSync(require('./Roboto.ttf')),
    weight: 400 as const,
    name: 'Roboto',
  },
  {
    data: readFileSync(require('./Roboto-Bold.ttf')),
    weight: 700 as const,
    name: 'Roboto-Bold',
  },
  {
    data: readFileSync(require('./Roboto-Black.ttf')),
    weight: 900 as const,
    name: 'Roboto-Black',
  },
];

export default async function jsxToSvg(jsx: JSX.Element) {
  return await satori(jsx, {
    width: 480,
    fonts,
  });
}
