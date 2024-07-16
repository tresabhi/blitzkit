import { AverageDefinitionsAllStats } from '../../blitzkit/averageDefinitions';
import { WSS_INCLUDE_KEYS } from './constants';

export function calculateWSS(
  sigma: AverageDefinitionsAllStats,
  mu: AverageDefinitionsAllStats,
  r: AverageDefinitionsAllStats,
  x: AverageDefinitionsAllStats,
) {
  const atoms = WSS_INCLUDE_KEYS.map((key) => {
    const normalizedX = x[key] / x.battles;
    const normalizedMu = mu[key] / mu.battles;
    const z = (normalizedX - normalizedMu) / sigma[key];
    return { z, w: r[key] };
  });
  const moment = atoms.reduce(
    (accumulator, { z, w }) => accumulator + z * w,
    0,
  );
  const weights = atoms.reduce((accumulator, { w }) => accumulator + w, 0);

  return moment / weights;
}
