import { RouteReturnable } from '../../server.js';
import jsxToSvg from '../node/jsxToSvg.js';

export default async function normalizeRouteReturnable(
  returnable: RouteReturnable,
) {
  const awaitedReturnable = await returnable;
  const svg = await jsxToSvg(awaitedReturnable);

  return svg;
}
