import { tankDefinitions, tankNames } from '@blitzkit/core';
import { Locale } from 'discord.js';
import { go } from 'fuzzysort';
import markdownEscape from 'markdown-escape';
import { tankNamesTechTreeOnly } from '../../../../bot/src/core/discord/autocompleteTanks';
import { translator } from '../../../../bot/src/core/localization/translator';
import { UserError } from '../../hooks/userError';

export default async function resolveTankId(
  tank: string | number,
  locale: Locale,
  techTreeOnly = false,
) {
  const { translate } = translator(locale);
  const number = typeof tank === 'string' ? Number(tank) : tank;

  if (Number.isNaN(number)) {
    const searchResult = go(
      `${tank}`,
      await (techTreeOnly ? tankNamesTechTreeOnly : tankNames),
      {
        keys: ['searchableName', 'searchableNameDeburr', 'camouflages'],
        limit: 1,
      },
    );

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
