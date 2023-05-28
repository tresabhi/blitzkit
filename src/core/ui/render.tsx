import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { ReactNode } from 'react';
import satori from 'satori';

const robotoFlex = readFileSync('src/assets/fonts/Roboto.ttf');
const robotoFlexBold = readFileSync('src/assets/fonts/Roboto-Bold.ttf');
const robotoFlexBlack = readFileSync('src/assets/fonts/Roboto-Black.ttf');

export default async function render(element: ReactNode) {
  const svg = await satori(element, {
    width: 640,
    fonts: [
      { data: robotoFlex, name: 'Roboto Flex', weight: 400 },
      { data: robotoFlexBold, name: 'Roboto Flex', weight: 700 },
      { data: robotoFlexBlack, name: 'Roboto Flex', weight: 900 },
    ],
  });
  const png = new Resvg(svg).render().asPng();

  return png;
}
