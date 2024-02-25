import { go } from 'fuzzysort';
import { UserError } from '../../hooks/userError';
import markdownEscape from 'markdown-escape';
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
      throw new UserError(
        `# Tank not found\nCould not find tank by the name "${markdownEscape(`${tank}`)}".`,
      );
    } else {
      return searchResult[0].obj.id;
    }
  } else {
    if ((await tankDefinitions)[number]) {
      return number;
    } else {
      throw new UserError(
        `# Tank not found\nCould not find tank by the ID "${number}". Try typing the name of the tank instead of a number.`,
      );
    }
  }
}
