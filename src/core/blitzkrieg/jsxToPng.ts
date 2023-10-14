import jsxToSvg from './jsxToSvg';
import svgToPng from './svgToPng';

export default async function jsxToPng(jsx: JSX.Element) {
  const svg = await jsxToSvg(jsx);
  const png = svgToPng(svg);

  return png;
}
