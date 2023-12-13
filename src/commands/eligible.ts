import { SlashCommandBuilder } from 'discord.js';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import { tankDefinitions } from '../core/blitzkrieg/definitions/tanks';
import getPeriodNow from '../core/blitzkrieg/getPeriodNow';
import getTimeDaysAgo from '../core/blitzkrieg/getTimeDaysAgo';
import getStatsInPeriod from '../core/blitzstars/getStatsInPeriod';
import { tankAverages } from '../core/blitzstars/tankAverages';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import embedNegative from '../core/discord/embedNegative';
import embedPositive from '../core/discord/embedPositive';
import markdownTable, { TableInput } from '../core/discord/markdownTable';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import calculateWN8 from '../core/statistics/calculateWN8';
import sumStats from '../core/statistics/sumStats';
import { CommandRegistry } from '../events/interactionCreate';
import { PossiblyPromise } from '../types/possiblyPromise';

export type SkilledClan = 'SKLLD' | 'SMRI';

export const SKILLED_CLANS: Record<SkilledClan, string> = {
  SKLLD: 'Skilled',
  SMRI: 'Samurai',
};

export const eligibleCommand: CommandRegistry = {
  inProduction: true,
  inPublic: false,

  command: new SlashCommandBuilder()
    .setName('eligible')
    .setDescription('Checks eligibility for any Skilled clan')
    .addStringOption((option) =>
      option
        .setName('clan')
        .setDescription('The clan to check')
        .setChoices(
          {
            name: SKILLED_CLANS.SKLLD,
            value: 'SKLLD' satisfies SkilledClan,
          },
          { name: SKILLED_CLANS.SMRI, value: 'SMRI' satisfies SkilledClan },
        )
        .setRequired(true),
    )
    .addStringOption(addUsernameChoices),

  async handler(interaction) {
    const clan = interaction.options.getString('clan') as SkilledClan;
    const { id, region: region } = await resolvePlayerFromCommand(interaction);
    const accountInfo = await getAccountInfo(region, id);
    const problems: TableInput = [];
    const title = `${accountInfo.nickname}'s eligibility for ${SKILLED_CLANS[clan]}`;
    let isEligible = false;
    let body = '';

    if (clan === 'SKLLD') {
      const { diff: diffed } = await getStatsInPeriod(
        region,
        id,
        getTimeDaysAgo(region, 30),
        getPeriodNow(),
      );
      const entries = Object.entries(diffed);
      const stats = sumStats(entries.map(([, stats]) => stats));
      const averageTier =
        (await entries.reduce<PossiblyPromise<number>>(
          async (accumulator, [tankIdString, stats]) => {
            const tankId = parseInt(tankIdString);
            const tankDefinition = (await tankDefinitions)[tankId];

            if (!tankDefinition) return accumulator;

            const tankTier = tankDefinition.tier;

            return (await accumulator) + tankTier * stats.battles;
          },
          0,
        )) /
        (await entries.reduce<PossiblyPromise<number>>(
          async (accumulator, [tankIdString, stats]) => {
            const tankId = parseInt(tankIdString);
            const tankDefinition = (await tankDefinitions)[tankId];

            if (!tankDefinition) return accumulator;

            return stats.battles;
          },
          0,
        ));
      const WN8 =
        (await entries.reduce<PossiblyPromise<number>>(
          async (accumulator, [tankIdString, stats]) => {
            const tankId = parseInt(tankIdString);

            // edge case where new tanks don't have averages
            if ((await tankAverages)[tankId]) {
              const tankWN8 = calculateWN8(
                (await tankAverages)[tankId].all,
                stats,
              );

              if (isNaN(tankWN8)) return accumulator;
              return (await accumulator) + tankWN8 * stats.battles;
            } else return accumulator;
          },
          0,
        )) / stats.battles;
      const tier10Damage =
        (await entries.reduce<PossiblyPromise<number>>(
          async (accumulator, [tankIdString, stats]) => {
            const tankId = parseInt(tankIdString);

            if ((await tankDefinitions)[tankId]?.tier === 10) {
              const tankStats = diffed[tankId];
              return (await accumulator) + tankStats.damage_dealt;
            } else return accumulator;
          },
          0,
        )) /
        (await entries.reduce<PossiblyPromise<number>>(
          async (accumulator, [tankIdString, stats]) => {
            const tankId = parseInt(tankIdString);

            if ((await tankDefinitions)[tankId]?.tier === 10) {
              const tankStats = diffed[tankId];
              return (await accumulator) + tankStats.battles;
            } else return accumulator;
          },
          0,
        ));

      if (stats.battles < 126) {
        problems.push(['Battles', `${stats.battles} (${stats.battles - 126})`]);
      }
      if (averageTier < 8) {
        problems.push([
          'Average tier',
          `${averageTier.toFixed(2)} (${(averageTier - 8).toFixed(2)})`,
        ]);
      }
      if (stats.wins / stats.battles < 0.6) {
        problems.push([
          'Winrate',
          `${(100 * (stats.wins / stats.battles)).toFixed(2)}% (${(
            100 *
            (stats.wins / stats.battles - 0.6)
          ).toFixed(2)}%)`,
        ]);
      }
      if (WN8 < 2450) {
        problems.push([
          'WN8',
          `${WN8.toFixed(0)} (${(WN8 - 2450).toFixed(0)})`,
        ]);
      }
      if (tier10Damage < 1250) {
        problems.push([
          'Tier 10 damage',
          `${tier10Damage.toFixed(0)} (${tier10Damage - 1250})`,
        ]);
      }

      isEligible = problems.length === 0;
      body = isEligible
        ? 'Player is fully eligible.'
        : `Player is not eligible. Shortcomings in 30-day statistics:\n\n${markdownTable(
            problems,
          )}`;
    } else if (clan === 'SMRI') {
      const stats = accountInfo.statistics.all;

      if (stats.battles < 1500) {
        problems.push([
          'Battles',
          `${stats.battles} (${stats.battles - 1500})`,
        ]);
      }
      if (stats.wins / stats.battles <= 0.53) {
        problems.push([
          'Winrate',
          `${(100 * (stats.wins / stats.battles)).toFixed(2)}% (${(
            100 *
            (stats.wins / stats.battles - 0.53)
          ).toFixed(2)}%)`,
        ]);
      }

      isEligible = problems.length === 0;
      body = isEligible
        ? 'Player is fully eligible.'
        : `Player is not eligible. Shortcomings in career statistics:\n\n${markdownTable(
            problems,
          )}`;
    }

    return (isEligible ? embedPositive : embedNegative)(title, body);
  },
};
