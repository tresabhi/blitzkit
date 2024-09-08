import { RenderConfiguration } from '../../../../website/src/core/blitzkit/renderConfiguration';
import { jsxToSvg } from './jsxToSvg';
import { svgToPngThreaded } from './svgToPngThreaded';

export async function jsxToPngThreaded(
  jsx: JSX.Element,
  renderConfiguration: RenderConfiguration,
) {
  const svg = await jsxToSvg(jsx, renderConfiguration);
  const png = await svgToPngThreaded(svg);
  return png;
}
