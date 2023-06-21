import { go } from 'fuzzysort';
import errorWithCause from '../process/errorWithCause.js';
import { TANKS, tankopedia } from './tankopedia.js';

export default function resolveTankId(tank: string) {
  const number = Number(tank);

  if (Number.isNaN(number)) {
    const searchResult = go(tank, TANKS, { keys: ['name'], limit: 1 });

    if (searchResult.length === 0) {
      throw errorWithCause(
        'Tank not found',
        `Could not find tank by the name "${tank}".`,
      );
    } else {
      return searchResult[0].obj.tank_id;
    }
  } else {
    if (tankopedia[number]) {
      return number;
    } else {
      throw errorWithCause(
        'Tank not found',
        `Could not find tank by the ID "${number}".`,
      );
    }
  }
}
