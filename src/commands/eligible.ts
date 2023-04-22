import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { NEGATIVE_COLOR, POSITIVE_COLOR } from '../constants/colors.js';
import { SERVERS } from '../constants/servers.js';
import blitzLinks from '../utilities/blitzLinks.js';
import getBlitzAccount from '../utilities/getBlitzAccount.js';
import getBlitzStarsAccount from '../utilities/getBlitzStarsAccount.js';
import poweredByBlitzStars from '../utilities/poweredByBlitzStars.js';

export async function execute(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const ign = interaction.options.getString('ign')!;
  const server = interaction.options.getString(
    'server',
  ) as keyof typeof SERVERS;

  getBlitzAccount(interaction, ign, server, async (account) => {
    getBlitzStarsAccount(interaction, account.account_id, ign, async (data) => {
      const sklldIssues: string[] = [];
      const smriIssues: string[] = [];

      if (data.period30d.all.battles < 150) {
        sklldIssues.push(
          `**Battles**: ${data.period30d.all.battles} (${
            data.period30d.all.battles - 150
          })`,
        );
      }
      if (data.period30d.avg_tier < 8) {
        sklldIssues.push(
          `**Tier**: ${data.period30d.avg_tier.toFixed(2)} (${(
            data.period30d.avg_tier - 8
          ).toFixed(2)})`,
        );
      }
      if (data.period30d.special.winrate < 60) {
        sklldIssues.push(
          `**Winrate**: ${data.period30d.special.winrate.toFixed(2)}% (${(
            data.period30d.special.winrate - 60
          ).toFixed(2)}%)`,
        );
      }
      if (data.period30d.wn8 < 2100) {
        sklldIssues.push(
          `**WN8**: ${data.period30d.wn8.toFixed(0)} (${(
            data.period30d.wn8 - 2100
          ).toFixed(0)})`,
        );
      }
      if (data.period30d.special.dpb < 2400) {
        sklldIssues.push(
          `**Damage per battle**: ${data.period30d.special.dpb.toFixed(0)} (${(
            data.period30d.special.dpb - 2400
          ).toFixed(0)})`,
        );
      }

      if (data.statistics.all.battles < 1500) {
        smriIssues.push(
          `**Battles**: ${data.statistics.all.battles} (${
            data.statistics.all.battles - 1500
          })`,
        );
      }
      if (data.statistics.special.winrate < 53) {
        smriIssues.push(
          `**Winrate**: ${data.statistics.special.winrate.toFixed(2)}% (${(
            data.statistics.special.winrate - 53
          ).toFixed(2)}%)`,
        );
      }

      await interaction.reply({
        embeds: [
          poweredByBlitzStars(
            new EmbedBuilder()
              .setTitle(`${data.nickname}'s eligibility for Skilled clans`)
              .setColor(
                sklldIssues.length === 0 || smriIssues.length === 0
                  ? POSITIVE_COLOR
                  : NEGATIVE_COLOR,
              )
              .setDescription(
                `${
                  sklldIssues.length === 0
                    ? '**✅ Player is eligible for `[SKLLD]`**'
                    : `**❌ \`[SKLLD] short by (30 days):\`**\n${sklldIssues.join(
                        '\n',
                      )}`
                }\n\n${
                  smriIssues.length === 0
                    ? '**✅ Player is eligible for `[SMRI]`**'
                    : `**❌ \`[SMRI] short by (career):\`**\n${smriIssues.join(
                        '\n',
                      )}`
                }\n\n${blitzLinks(data)}`,
              ),
          ),
        ],
      });

      console.log(`Showing ${data.nickname}'s eligibility for Skilled clans`);
    });
  });
}

export const data = new SlashCommandBuilder()
  .setName('eligible')
  .setDescription("Gets the user's eligibility for Skilled clans")
  .addStringOption((option) =>
    option
      .setName('server')
      .setDescription('The Blitz server you are in')
      .addChoices(
        { name: SERVERS.com, value: 'com' },
        { name: SERVERS.eu, value: 'eu' },
        { name: SERVERS.asia, value: 'asia' },
      )
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('ign')
      .setDescription('The username you use in Blitz')
      .setRequired(true),
  );
