import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { NEGATIVE_COLOR, POSITIVE_COLOR } from '../constants/colors.js';
import { BlitzServer } from '../constants/servers.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import validateUsername from '../core/blitz/validateUsername.js';
import blitzStarsLinks from '../core/blitzstars/blitzStarsLinks.js';
import getBlitzStarsAccount from '../core/blitzstars/getBlitzStarsAccount.js';
import poweredByBlitzStars from '../core/blitzstars/poweredByBlitzStars.js';
import cmdName from '../core/interaction/cmdName.js';
import addServerChoices from '../core/options/addServerChoices.js';
import addUsernameOption from '../core/options/addUsernameOption.js';

const CLANS = {
  sklld: { id: 71559, name: 'Skilled' },
  smri: { id: 91244, name: 'Samurai' },
};

export default {
  inProduction: false,
  inDevelopment: true,
  inPublic: false,

  command: new SlashCommandBuilder()
    .setName(cmdName('eligible'))
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
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    const clan = interaction.options.getString('clan') as keyof typeof CLANS;
    const name = interaction.options.getString('username')!;
    const server = interaction.options.getString('server') as BlitzServer;
    const blitzAccount = await validateUsername(interaction, name, server);

    if (!blitzAccount) return;

    const blitzStarsAccount = await getBlitzStarsAccount(
      interaction,
      blitzAccount.account_id,
    );
    if (!blitzStarsAccount) return;

    const issues: string[] = [];

    if (clan === 'sklld') {
      if (blitzStarsAccount.period30d.all.battles < 150) {
        issues.push(
          `**Battles**: ${blitzStarsAccount.period30d.all.battles} (${
            blitzStarsAccount.period30d.all.battles - 150
          })`,
        );
      }
      if (blitzStarsAccount.period30d.avg_tier < 8) {
        issues.push(
          `**Tier**: ${blitzStarsAccount.period30d.avg_tier.toFixed(2)} (${(
            blitzStarsAccount.period30d.avg_tier - 8
          ).toFixed(2)})`,
        );
      }
      if (blitzStarsAccount.period30d.special.winrate < 60) {
        issues.push(
          `**Winrate**: ${blitzStarsAccount.period30d.special.winrate.toFixed(
            2,
          )}% (${(blitzStarsAccount.period30d.special.winrate - 60).toFixed(
            2,
          )}%)`,
        );
      }
      if (blitzStarsAccount.period30d.wn8 < 2100) {
        issues.push(
          `**WN8**: ${blitzStarsAccount.period30d.wn8.toFixed(0)} (${(
            blitzStarsAccount.period30d.wn8 - 2100
          ).toFixed(0)})`,
        );
      }
      if (blitzStarsAccount.period30d.special.dpb < 2400) {
        issues.push(
          `**Damage per battle**: ${blitzStarsAccount.period30d.special.dpb.toFixed(
            0,
          )} (${(blitzStarsAccount.period30d.special.dpb - 2400).toFixed(0)})`,
        );
      }
    } else {
      if (blitzStarsAccount.statistics.all.battles < 1500) {
        issues.push(
          `**Battles**: ${blitzStarsAccount.statistics.all.battles} (${
            blitzStarsAccount.statistics.all.battles - 1500
          })`,
        );
      }
      if (blitzStarsAccount.statistics.special.winrate < 53) {
        issues.push(
          `**Winrate**: ${blitzStarsAccount.statistics.special.winrate.toFixed(
            2,
          )}% (${(blitzStarsAccount.statistics.special.winrate - 53).toFixed(
            2,
          )}%)`,
        );
      }
    }

    const eligible = issues.length === 0;

    await interaction.editReply({
      embeds: [
        poweredByBlitzStars(
          new EmbedBuilder()
            .setTitle(
              `${markdownEscape(blitzStarsAccount.nickname)} is ${
                eligible ? '' : 'not '
              }eligible for ${CLANS[clan].name}`,
            )
            .setColor(eligible ? POSITIVE_COLOR : NEGATIVE_COLOR)
            .setDescription(
              `${
                eligible
                  ? `${markdownEscape(
                      blitzStarsAccount.nickname,
                    )} meets all the requirements set for ${CLANS[clan].name}.`
                  : `${markdownEscape(
                      blitzStarsAccount.nickname,
                    )}'s shortcomings for ${CLANS[clan].name} (${
                      clan === 'sklld' ? '30 days stats' : 'career stats'
                    }):\n\n${issues.join('\n')}`
              }\n\n${blitzStarsLinks(server, blitzAccount.nickname)}`,
            ),
        ),
      ],
    });

    console.log(
      `Showing ${blitzStarsAccount.nickname}'s eligibility for ${CLANS[clan].name}`,
    );
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
