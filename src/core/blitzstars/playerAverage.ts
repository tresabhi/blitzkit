import sumStats from '../blitz/sumStats.js';
import { emptyAllStats } from './getTankStatsDiffed.js';
import { tankAverages } from './tankAverages.js';

console.log('Calculating player average...');
export const playerAverage = Object.entries(tankAverages).reduce(
  (accumulator, [, tankAverage]) => {
    return sumStats([accumulator, tankAverage.all]);
  },
  emptyAllStats,
);
console.log('Calculated player average');
