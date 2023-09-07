import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import autocompleteClan from '../core/discord/autocompleteClan';
import embedInfo from '../core/discord/embedInfo';
import { secrets } from '../core/node/secrets';
import { CommandRegistry } from '../events/interactionCreate';

const DEFAULT_THRESHOLD = 7;

export const clanEventCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('clan-event')
    .setDescription('Lists all inactive players')
    .addStringOption((option) =>
      option
        .setName('clan')
        .setDescription('The clan name or tag you are checking')
        .setRequired(true),
    ),

  async handler(interaction) {
    const REGION = 'com';
    const CLAN_SEARCH = interaction.options.getString('clan', true);

    const {
      clan_id,
      name: clan_name,
      tag: clan_tag,
    } = await fetch(
      `https://api.wotblitz.${REGION}/wotb/clans/list/?application_id=${secrets.WARGAMING_APPLICATION_ID}&search=${CLAN_SEARCH}`,
    )
      .then((response) => response.json())
      .then(({ data }) => data[0]);
    const memebers = await fetch(
      `https://api.wotblitz.${REGION}/wotb/clans/info/?application_id=${secrets.WARGAMING_APPLICATION_ID}&clan_id=${clan_id}`,
    )
      .then((response) => response.json())
      .then(({ data }) => data[clan_id].members_ids);
    const stats = await Promise.all(
      memebers.map(async (id, index) => {
        await new Promise((resolve) => setTimeout(resolve, index * 200));

        const [yesterdayPlatoonWins, name, todayPlatoonWins] =
          await Promise.all([
            fetch(`https://www.blitzstars.com/api/playerstats/${id}`)
              .then((response) => response.json())
              .then((data) => data[0]?.achievements.jointVictoryCount),
            fetch(
              `https://api.wotblitz.${REGION}/wotb/account/info/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${id}`,
            )
              .then((response) => response.json())
              .then(({ data }) => data[id].nickname),
            fetch(
              `https://api.wotblitz.${REGION}/wotb/account/achievements/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${id}`,
            )
              .then((response) => response.json())
              .then(({ data }) => data[id].max_series.jointVictory),
          ]);

        return {
          id,
          name,
          yesterdayPlatoonWins,
          todayPlatoonWins,
        };
      }),
    );

    return embedInfo(
      `Estimation of ${clan_name} [${clan_tag}]'s total platoon wins today: ${(
        stats.reduce(
          (accumulator, player) =>
            accumulator +
            (player.yesterdayPlatoonWins === undefined
              ? 0
              : player.todayPlatoonWins - player.yesterdayPlatoonWins),
          0,
        ) / 2
      ).toFixed(0)}`,
      stats
        .sort(
          (playerA, playerB) =>
            (playerB.yesterdayPlatoonWins === undefined
              ? 0
              : playerB.todayPlatoonWins - playerB.yesterdayPlatoonWins) -
            (playerA.yesterdayPlatoonWins === undefined
              ? 0
              : playerA.todayPlatoonWins - playerA.yesterdayPlatoonWins),
        )
        .map(
          (player) =>
            `${markdownEscape(player.name)}: ${
              player.yesterdayPlatoonWins === undefined
                ? 0
                : player.todayPlatoonWins - player.yesterdayPlatoonWins
            }`,
        )
        .join('\n'),
    );
  },

  autocomplete: autocompleteClan,
};
