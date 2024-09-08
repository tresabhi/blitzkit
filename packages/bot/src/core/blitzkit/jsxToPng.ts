import { jsxToSvg } from './jsxToSvg';
import { svgToPng } from './svgToPng';

export async function jsxToPng(jsx: JSX.Element) {
  const svg = await jsxToSvg(jsx);
  const png = svgToPng(svg);

  return png;
}
