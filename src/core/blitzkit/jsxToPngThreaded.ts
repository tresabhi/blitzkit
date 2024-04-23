import jsxToSvg from './jsxToSvg';
import { svgToPngThreaded } from './svgToPngThreaded';

export default async function jsxToPngThreaded(jsx: JSX.Element) {
  const svg = await jsxToSvg(jsx);
  const png = await svgToPngThreaded(svg);

  return png;
}
