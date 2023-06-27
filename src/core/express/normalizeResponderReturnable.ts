import { ResponderReturnable } from '../../server.js';
import jsxToSvg from '../node/jsxToSvg.js';

export default async function normalizeResponderReturnable(
  returnable: ResponderReturnable,
) {
  const awaitedReturnable = await returnable;
  const svg = await jsxToSvg(awaitedReturnable);

  return svg;
}
