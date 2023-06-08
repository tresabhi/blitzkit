import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'fs';
import { ReactNode } from 'react';
import satori from 'satori';

const FONT_NAME = 'Roboto';
const FONT_FILES = ['Roboto', 'Roboto-Bold', 'Roboto-Black'];

let robotoFlex: Buffer;
let robotoFlexBold: Buffer;
let robotoFlexBlack: Buffer;

console.log('Importing fonts...');
await Promise.all(
  FONT_FILES.map(
    (file) =>
      new Promise<Buffer>((resolve, reject) => {
        readFile(`src/assets/fonts/${file}.ttf`, (error, data) => {
          if (error) reject(error);
          resolve(data);
        });
      }),
  ),
).then((data) => {
  [robotoFlex, robotoFlexBold, robotoFlexBlack] = data;
  console.log('Fonts imported');
});

export default async function render(element: ReactNode) {
  const svg = await satori(element, {
    width: 640,
    fonts: [
      { data: robotoFlex, name: FONT_NAME, weight: 400 },
      { data: robotoFlexBold, name: FONT_NAME, weight: 700 },
      { data: robotoFlexBlack, name: FONT_NAME, weight: 900 },
    ],
  });
  const png = new Resvg(svg).render().asPng();

  return png;
}
