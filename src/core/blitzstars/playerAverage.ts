import sumStats from '../blitz/sumStats';
import { emptyAllStats } from './getDiffedTankStats';
import { tankAverages } from './tankAverages';

console.log('Calculating player average...');
export const playerAverage = Object.entries(await tankAverages).reduce(
  (accumulator, [, tankAverage]) => {
    return sumStats([accumulator, tankAverage.all]);
  },
  emptyAllStats,
);
console.log('Calculated player average');
