import { readFile } from 'fs/promises';
import satori from 'satori';

const FONT_NAME = 'Roboto';
const FONT_FILES = [
  { weight: 400 as const, path: require('../../assets/fonts/Roboto.ttf') },
  { weight: 700 as const, path: require('../../assets/fonts/Roboto-Bold.ttf') },
  {
    weight: 900 as const,
    path: require('../../assets/fonts/Roboto-Black.ttf'),
  },
];

const fonts = Promise.all(
  FONT_FILES.map(({ path, weight }) =>
    readFile(path).then((data) => ({
      data: Buffer.from(data.buffer),
      name: FONT_NAME,
      weight,
    })),
  ),
);

export default async function jsxToSvg(jsx: JSX.Element) {
  return await satori(jsx, {
    width: 480,
    fonts: await fonts,
  });
}
