import { RouteReturnable } from '../../server';
import jsxToSvg from '../node/jsxToSvg';

export default async function normalizeRouteReturnable(
  returnable: RouteReturnable,
) {
  const awaitedReturnable = await returnable;
  const svg = await jsxToSvg(awaitedReturnable);

  return svg;
}
