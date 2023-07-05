import { go } from 'fuzzysort';
import throwError from '../node/throwError.js';
import { TANKS, tankopedia } from './tankopedia.js';

export default async function resolveTankId(tank: string) {
  const number = parseInt(tank);

  if (Number.isNaN(number)) {
    const searchResult = go(tank, TANKS, { keys: ['name'], limit: 1 });

    if (searchResult.length === 0) {
      throw throwError(
        'Tank not found',
        `Could not find tank by the name "${tank}".`,
      );
    } else {
      return searchResult[0].obj.tank_id;
    }
  } else {
    if ((await tankopedia)[number]) {
      return number;
    } else {
      throw throwError(
        'Tank not found',
        `Could not find tank by the ID "${number}".`,
      );
    }
  }
}
