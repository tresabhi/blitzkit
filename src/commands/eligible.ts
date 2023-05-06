import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { NEGATIVE_COLOR, POSITIVE_COLOR } from '../constants/colors.js';
import { BlitzServer } from '../constants/servers.js';
import addIGNOption from '../utilities/addIGNOption.js';
import addServerChoices from '../utilities/addServerChoices.js';
import blitzLinks from '../utilities/blitzLinks.js';
import getBlitzAccount from '../utilities/getBlitzAccount.js';
import getBlitzStarsAccount from '../utilities/getBlitzStarsAccount.js';
import poweredByBlitzStars from '../utilities/poweredByBlitzStars.js';

const CLANS = {
  sklld: { id: 71559, name: 'Skilled' },
  smri: { id: 91244, name: 'Samurai' },
};

export default {
  inProduction: false,
  inDevelopment: false,
  inPublic: false,

  command: new SlashCommandBuilder()
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
    .addStringOption(addServerChoices)
    .addStringOption(addIGNOption),

  execute(interaction) {
    const name = interaction.options.getString('name')!;
    const server = interaction.options.getString('server') as BlitzServer;
    const clan = interaction.options.getString('clan') as keyof typeof CLANS;

    getBlitzAccount(interaction, name, server, async (account) => {
      getBlitzStarsAccount(
        interaction,
        account.account_id,
        name,
        async (data) => {
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
                `**Winrate**: ${data.statistics.special.winrate.toFixed(
                  2,
                )}% (${(data.statistics.special.winrate - 53).toFixed(2)}%)`,
              );
            }
          }

          const eligible = issues.length === 0;

          await interaction.editReply({
            embeds: [
              poweredByBlitzStars(
                new EmbedBuilder()
                  .setTitle(
                    `${markdownEscape(data.nickname)} is ${
                      eligible ? '' : 'not '
                    }eligible for ${CLANS[clan].name}`,
                  )
                  .setColor(eligible ? POSITIVE_COLOR : NEGATIVE_COLOR)
                  .setDescription(
                    `${
                      eligible
                        ? `${markdownEscape(
                            data.nickname,
                          )} meets all the requirements set for ${
                            CLANS[clan].name
                          }.`
                        : `${markdownEscape(
                            data.nickname,
                          )}'s shortcomings for ${CLANS[clan].name} (${
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
        },
      );
    });
  },
} satisfies CommandRegistry;
