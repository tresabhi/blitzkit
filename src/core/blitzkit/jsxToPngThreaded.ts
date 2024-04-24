import jsxToSvg from './jsxToSvg';
import { RenderConfiguration } from './renderConfiguration';
import { svgToPngThreaded } from './svgToPngThreaded';

export default async function jsxToPngThreaded(
  jsx: JSX.Element,
  renderConfiguration: RenderConfiguration,
) {
  const svg = await jsxToSvg(jsx, renderConfiguration);
  const png = await svgToPngThreaded(svg);
  return png;
}
