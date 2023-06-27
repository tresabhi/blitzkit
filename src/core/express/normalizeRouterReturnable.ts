import { RouterReturnable } from '../../server.js';
import jsxToSvg from '../node/jsxToSvg.js';

export default async function normalizeRouterReturnable(
  returnable: RouterReturnable,
) {
  const awaitedReturnable = await returnable;
  const svg = await jsxToSvg(awaitedReturnable);

  return svg;
}
