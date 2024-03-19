// what the hell is this script???

import { writeFile } from 'fs/promises';
import { Region } from '../src/constants/regions';
import { getRatingsNeighbors } from '../src/core/blitz/getRatingsNeighbors';

const REGION: Region = 'com';
const PLAYER = 1041988373;
const ITERATIONS = 2 ** 4;
const MAX_NEIGHBORS = 2 ** 7;
const data: [number, number][] = [];
let finished = 0;

for (let index = 0; index < ITERATIONS; index++) {
  const neighbors = Math.round((Math.random() * MAX_NEIGHBORS) / 2) * 2;
  const start = Date.now();

  console.log(`🟡 Iteration ${index} with ${neighbors} neighbors`);

  try {
    await getRatingsNeighbors(REGION, PLAYER, neighbors);

    finished++;
    console.log(
      `🟢 (${Math.round(
        100 * (finished / ITERATIONS),
      )}%) Iteration ${index} with ${neighbors} neighbors`,
    );

    const end = Date.now();
    const time = end - start;

    data.push([neighbors, time]);
  } catch (error) {
    console.log(
      `🔴 Iteration ${index} with ${neighbors} neighbors\n\n${error}`,
    );
  }
}

console.log('🟢 Done, sorting');
data.sort(([neighborsA], [neighborsB]) => neighborsA - neighborsB);

console.log('🟢 Writing');
writeFile(
  'dist/ratingsPlot.csv',
  data.map(([neighbors, time]) => `${neighbors},${time}`).join('\n'),
);
