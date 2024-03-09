import { Locale } from 'discord.js';
import { go } from 'fuzzysort';
import markdownEscape from 'markdown-escape';
import { UserError } from '../../hooks/userError';
import {
  tankDefinitions,
  tanksDefinitionsArray,
} from '../blitzkrieg/tankDefinitions';
import { translator } from '../localization/translator';

export default async function resolveTankId(
  tank: string | number,
  locale: Locale,
) {
  const { translate } = translator(locale);
  const number = typeof tank === 'string' ? parseInt(tank) : tank;

  if (Number.isNaN(number)) {
    const searchResult = go(`${tank}`, await tanksDefinitionsArray, {
      keys: ['name'],
      limit: 1,
    });

    if (searchResult.length === 0) {
      throw new UserError(
        translate('bot.common.errors.tank_name_not_found', [
          markdownEscape(`${tank}`),
        ]),
      );
    } else {
      return searchResult[0].obj.id;
    }
  } else {
    if ((await tankDefinitions)[number]) {
      return number;
    } else {
      throw new UserError(
        translate('bot.common.errors.tank_id_not_found', [`${number}`]),
      );
    }
  }
}
