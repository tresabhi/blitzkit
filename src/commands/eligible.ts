import { SlashCommandBuilder } from 'discord.js';
import getWN8 from '../core/blitz/getWN8.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import sumStats from '../core/blitz/sumStats.js';
import { tankopedia } from '../core/blitz/tankopedia.js';
import getPeriodNow from '../core/blitzstars/getPeriodNow.js';
import getPeriodStart from '../core/blitzstars/getPeriodStart.js';
import getTankStatsOverTime from '../core/blitzstars/getTankStatsOverTime.js';
import { tankAverages } from '../core/blitzstars/tankAverages.js';
import cleanTable, { TableInput } from '../core/interaction/cleanTable.js';
import negativeEmbed from '../core/interaction/negativeEmbed.js';
import positiveEmbed from '../core/interaction/positiveEmbed.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import resolvePlayer from '../core/options/resolvePlayer.js';
import { WARGAMING_APPLICATION_ID } from '../core/process/args.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo } from '../types/accountInfo.js';

export type SkilledClan = 'SKLLD' | 'SMRI';

export const SKILLED_CLANS: Record<SkilledClan, string> = {
  SKLLD: 'Skilled',
  SMRI: 'Samurai',
};

export default {
  inProduction: true,
  inDevelopment: false,
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
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    const clan = interaction.options.getString('clan') as SkilledClan;
    const { id, server } = await resolvePlayer(interaction);
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    );
    const problems: TableInput = [];
    const title = `${accountInfo[id].nickname}'s eligibility for ${SKILLED_CLANS[clan]}`;
    let isEligible = false;
    let body = '';

    if (clan === 'SKLLD') {
      const tankStatsOverTime = await getTankStatsOverTime(
        server,
        id,
        getPeriodStart('30'),
        getPeriodNow(),
      );
      const entries = Object.entries(tankStatsOverTime);
      const stats = sumStats(entries.map(([, stats]) => stats));
      const averageTier =
        entries.reduce((accumulator, [tankIdString, stats]) => {
          const tankId = parseInt(tankIdString);
          const tankTier = tankopedia[tankId].tier;

          return accumulator + tankTier * stats.battles;
        }, 0) / stats.battles;
      const WN8 =
        entries.reduce((accumulator, [tankIdString, stats]) => {
          const tankId = parseInt(tankIdString);

          // edge case where new tanks don't have averages
          if (tankAverages[tankId]) {
            const tankWN8 = getWN8(tankAverages[tankId].all, stats);

            if (isNaN(tankWN8)) return accumulator;
            return accumulator + tankWN8 * stats.battles;
          } else return accumulator;
        }, 0) / stats.battles;
      const tier10Damage =
        entries.reduce((accumulator, [tankIdString, stats]) => {
          const tankId = parseInt(tankIdString);

          if (tankopedia[tankId]?.tier === 10) {
            const tankStats = tankStatsOverTime[tankId];
            return accumulator + tankStats.damage_dealt;
          } else return accumulator;
        }, 0) /
        entries.reduce((accumulator, [tankIdString, stats]) => {
          const tankId = parseInt(tankIdString);

          if (tankopedia[tankId]?.tier === 10) {
            const tankStats = tankStatsOverTime[tankId];
            return accumulator + tankStats.battles;
          } else return accumulator;
        }, 0);

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
        : `Player is not eligible. Shortcomings in 30-day statistics:\n\n${cleanTable(
            problems,
          )}`;
    } else if (clan === 'SMRI') {
      const stats = accountInfo[id].statistics.all;

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
        : `Player is not eligible. Shortcomings in career statistics:\n\n${cleanTable(
            problems,
          )}`;
    }

    return (isEligible ? positiveEmbed : negativeEmbed)(title, body);
  },
} satisfies CommandRegistry;
