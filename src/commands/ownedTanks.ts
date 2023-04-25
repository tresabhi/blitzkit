import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { SKILLED_COLOR } from '../constants/colors.js';
import { SERVERS } from '../constants/servers.js';
import { TanksStats } from '../types/tanksStats.js';
import getBlitzAccount from '../utilities/getBlitzAccount.js';
import { tankTypeEmojis, tankopedia } from '../utilities/tankopedia.js';
import fetch from 'node-fetch';

export async function execute(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const server = interaction.options.getString(
    'server',
  ) as keyof typeof SERVERS;
  const ign = interaction.options.getString('ign')!;
  let tier = interaction.options.getNumber('tier');

  tier = tier === null ? null : Math.round(tier);

  getBlitzAccount(interaction, ign, server, async (account) => {
    const tankStats = (await (
      await fetch(
        `https://api.wotblitz.${server}/wotb/tanks/stats/?application_id=${process.env.WARGAMING_APPLICATION_ID}&account_id=${account.account_id}`,
      )
    ).json()) as TanksStats;

    const tanks = tankStats.data[account.account_id]!.map(
      (tankData) => tankopedia.data[tankData.tank_id],
    );
    const tierSortedTanks: Record<number, typeof tanks> = {};
    const tiers: number[] = [];

    for (const tank of tanks) {
      if (!tierSortedTanks[tank.tier]) {
        tierSortedTanks[tank.tier] = [tank];
      } else {
        tierSortedTanks[tank.tier].push(tank);
      }

      if (tier === null && !tiers.includes(tank.tier)) tiers.push(tank.tier);
    }

    if (tier === null) {
      tiers.sort((a, b) => b - a);
    } else {
      tiers.push(tier);
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            `${account.nickname}'s owned ${
              tier === null ? '' : `tier ${tier} `
            }tanks`,
          )
          .setDescription(
            tiers
              .map((iterationTier) => {
                return `${tier === null ? `**Tier ${iterationTier}**:\n` : ''}${
                  tierSortedTanks[iterationTier] === undefined
                    ? `No tanks found for player in tier ${tier}`
                    : tierSortedTanks[iterationTier]
                        .map(
                          (tank) =>
                            `${tankTypeEmojis[tank.type]} ${tank.name} ${
                              tank.is_premium ? '⭐' : ''
                            }`,
                        )
                        .join('\n')
                }`;
              })
              .join('\n\n'),
          )
          .setColor(SKILLED_COLOR),
      ],
    });
  });
}

export const data = new SlashCommandBuilder()
  .setName('ownedtanks')
  .setDescription("Shows a player's owned tanks")
  .addStringOption((option) =>
    option
      .setName('server')
      .setDescription('The Blitz server you are in')
      .setRequired(true)
      .addChoices(
        { name: SERVERS.com, value: 'com' },
        { name: SERVERS.eu, value: 'eu' },
        { name: SERVERS.asia, value: 'asia' },
      ),
  )
  .addStringOption((option) =>
    option
      .setName('ign')
      .setDescription('The username you use in Blitz')
      .setRequired(true),
  )
  .addNumberOption((option) =>
    option
      .setName('tier')
      .setDescription('The tier you want to see (default: all tiers)')
      .setMinValue(1)
      .setMaxValue(10)
      .setRequired(true),
  );
