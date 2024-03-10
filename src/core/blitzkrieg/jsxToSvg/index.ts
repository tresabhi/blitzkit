import { readFileSync } from 'fs';
import satori from 'satori';

const fonts = [
  {
    file: require('./Roboto.ttf') as string,
    weight: 400 as const,
  },
  {
    file: require('./Roboto-Bold.ttf') as string,
    weight: 700 as const,
  },
  {
    file: require('./Roboto-Black.ttf') as string,
    weight: 900 as const,
  },
];

export default async function jsxToSvg(jsx: JSX.Element) {
  return await satori(jsx, {
    width: 480,
    fonts: fonts.map(({ file, weight }) => ({
      weight,
      name: 'Roboto',
      data: readFileSync(`${__dirname}/${file}`),
    })),
  });
}
