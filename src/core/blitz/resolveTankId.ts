import { go } from 'fuzzysort';
import { UserError } from '../../hooks/userError';
import {
  tankDefinitions,
  tanksDefinitionsArray,
} from '../blitzkrieg/tankDefinitions';

export default async function resolveTankId(tank: string | number) {
  const number = typeof tank === 'string' ? parseInt(tank) : tank;

  if (Number.isNaN(number)) {
    const searchResult = go(`${tank}`, await tanksDefinitionsArray, {
      keys: ['name'],
      limit: 1,
    });

    if (searchResult.length === 0) {
      throw new UserError('Tank not found', {
        cause: `Could not find tank by the name "${tank}".`,
      });
    } else {
      return searchResult[0].obj.id;
    }
  } else {
    if ((await tankDefinitions)[number]) {
      return number;
    } else {
      throw new UserError('Tank not found', {
        cause: `Could not find tank by the ID "${number}".`,
      });
    }
  }
}
