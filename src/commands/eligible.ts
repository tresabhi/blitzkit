import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { NEGATIVE_COLOR, POSITIVE_COLOR } from '../constants/colors.js';
import { BLITZ_SERVERS, BlitzServer } from '../constants/servers.js';
import blitzLinks from '../utilities/blitzLinks.js';
import getBlitzAccount from '../utilities/getBlitzAccount.js';
import getBlitzStarsAccount from '../utilities/getBlitzStarsAccount.js';
import poweredByBlitzStars from '../utilities/poweredByBlitzStars.js';

export const CLANS = {
  sklld: {
    name: 'Skilled',
    id: 71559,
  },
  smri: {
    name: 'Samurai',
    id: 91244,
  },
};

export async function execute(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const ign = interaction.options.getString('ign')!;
  const server = interaction.options.getString('server') as BlitzServer;
  const clan = interaction.options.getString('clan') as keyof typeof CLANS;

  getBlitzAccount(interaction, ign, server, async (account) => {
    getBlitzStarsAccount(interaction, account.account_id, ign, async (data) => {
      const issues: string[] = [];

      if (clan === 'sklld') {
        if (data.period30d.all.battles < 150) {
          issues.push(
            `**Battles**: ${data.period30d.all.battles} (${
              data.period30d.all.battles - 150
            })`,
          );
        }
        if (data.period30d.avg_tier < 8) {
          issues.push(
            `**Tier**: ${data.period30d.avg_tier.toFixed(2)} (${(
              data.period30d.avg_tier - 8
            ).toFixed(2)})`,
          );
        }
        if (data.period30d.special.winrate < 60) {
          issues.push(
            `**Winrate**: ${data.period30d.special.winrate.toFixed(2)}% (${(
              data.period30d.special.winrate - 60
            ).toFixed(2)}%)`,
          );
        }
        if (data.period30d.wn8 < 2100) {
          issues.push(
            `**WN8**: ${data.period30d.wn8.toFixed(0)} (${(
              data.period30d.wn8 - 2100
            ).toFixed(0)})`,
          );
        }
        if (data.period30d.special.dpb < 2400) {
          issues.push(
            `**Damage per battle**: ${data.period30d.special.dpb.toFixed(
              0,
            )} (${(data.period30d.special.dpb - 2400).toFixed(0)})`,
          );
        }
      } else {
        if (data.statistics.all.battles < 1500) {
          issues.push(
            `**Battles**: ${data.statistics.all.battles} (${
              data.statistics.all.battles - 1500
            })`,
          );
        }
        if (data.statistics.special.winrate < 53) {
          issues.push(
            `**Winrate**: ${data.statistics.special.winrate.toFixed(2)}% (${(
              data.statistics.special.winrate - 53
            ).toFixed(2)}%)`,
          );
        }
      }

      const eligible = issues.length === 0;

      await interaction.reply({
        embeds: [
          poweredByBlitzStars(
            new EmbedBuilder()
              .setTitle(
                `${data.nickname} is ${eligible ? '' : 'not '}eligible for ${
                  CLANS[clan].name
                }`,
              )
              .setColor(eligible ? POSITIVE_COLOR : NEGATIVE_COLOR)
              .setDescription(
                `${
                  eligible
                    ? `${data.nickname} meets all the requirements set for ${CLANS[clan].name}.`
                    : `${data.nickname}'s shortcomings for ${
                        CLANS[clan].name
                      } (${
                        clan === 'sklld' ? '30 days stats' : 'career stats'
                      }):\n\n${issues.join('\n')}`
                }\n\n${blitzLinks(data)}`,
              ),
          ),
        ],
      });

      console.log(
        `Showing ${data.nickname}'s eligibility for ${CLANS[clan].name}`,
      );
    });
  });
}

export const data = new SlashCommandBuilder()
  .setName('eligible')
  .setDescription("Gets the user's eligibility for Skilled clans")
  .addStringOption((option) =>
    option
      .setName('clan')
      .setDescription('The Skilled clan you are checking')
      .addChoices(
        { name: CLANS.sklld.name, value: 'sklld' },
        { name: CLANS.smri.name, value: 'smri' },
      )
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('server')
      .setDescription('The Blitz server you are in')
      .addChoices(
        { name: BLITZ_SERVERS.com, value: 'com' },
        { name: BLITZ_SERVERS.eu, value: 'eu' },
        { name: BLITZ_SERVERS.asia, value: 'asia' },
      )
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('ign')
      .setDescription('The username you use in Blitz')
      .setRequired(true),
  );
