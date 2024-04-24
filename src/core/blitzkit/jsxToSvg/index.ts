import { readFileSync } from 'fs';
import satori from 'satori';
import { RenderConfiguration } from '../renderConfiguration';
import robotoBlack from './Roboto-Black.ttf';
import robotoBold from './Roboto-Bold.ttf';
import roboto from './Roboto.ttf';

const fonts = [
  { file: roboto, weight: 400 as const },
  { file: robotoBold, weight: 700 as const },
  { file: robotoBlack, weight: 900 as const },
];

export default async function jsxToSvg(
  jsx: JSX.Element,
  renderConfiguration: RenderConfiguration,
) {
  return await satori(jsx, {
    width: renderConfiguration.width,
    fonts: fonts.map(({ file, weight }) => ({
      weight,
      name: 'Roboto',
      data: readFileSync(`${__dirname}/${file}`),
    })),
  });
}
