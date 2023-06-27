import { readFile } from 'fs';
import { join } from 'path';
import satori from 'satori';
import robotoBlackFile from '../../assets/fonts/Roboto-Black.ttf';
import robotoBoldFile from '../../assets/fonts/Roboto-Bold.ttf';
import robotoFile from '../../assets/fonts/Roboto.ttf';

const FONT_NAME = 'Roboto';
const FONT_FILES = [robotoFile, robotoBoldFile, robotoBlackFile];

let roboto: Buffer;
let robotoBold: Buffer;
let robotoBlack: Buffer;

console.log('Importing fonts...');
Promise.all(
  FONT_FILES.map(
    (file) =>
      new Promise<Buffer>((resolve, reject) => {
        const path = join(__dirname, file);

        readFile(path, (error, data) => {
          if (error) reject(error);
          resolve(data);
        });
      }),
  ),
).then((data) => {
  [roboto, robotoBold, robotoBlack] = data;
  console.log('Fonts imported');
});

export default async function jsxToSvg(jsx: JSX.Element) {
  return await satori(jsx, {
    width: 640,
    fonts: [
      { data: roboto, name: FONT_NAME, weight: 400 },
      { data: robotoBold, name: FONT_NAME, weight: 700 },
      { data: robotoBlack, name: FONT_NAME, weight: 900 },
    ],
  });
}
