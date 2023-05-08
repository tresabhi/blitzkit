import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { SKILLED_COLOR } from '../constants/colors.js';
import { TanksStats } from '../types/tanksStats.js';
import addIGNOption from '../utilities/addIGNOption.js';
import addServerChoices from '../utilities/addServerChoices.js';
import { args } from '../utilities/args.js';
import extractUser from '../utilities/extractUser.js';
import getBlitzAccount from '../utilities/getBlitzAccount.js';
import getWargamingResponse from '../utilities/getWargamingResponse.js';
import { TANK_TYPE_EMOJIS, tankopedia } from '../utilities/tankopedia.js';

const COMP_TANKS = [
  // light tanks
  24321, // t-100 lt
  20257, // sheridan
  3649, // bat chat
  19537, // vickers

  // heavy tanks
  6145, // is-4
  7169, // is-7
  10785, // t110e5
  12161, // strvk
  4481, // kranvagn
  22817, // m6 yoh
  6225, // fv215b
  5425, // wz 113
  7297, // 60tp
  58641, // vk 72
  6753, // type 71
];

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('tanksdev')
    .setDescription("Shows a player's owned tanks")
    .addIntegerOption((option) =>
      option
        .setName('tier')
        .setDescription('The tier you want to see')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(true),
    )
    .addStringOption(addServerChoices)
    .addStringOption(addIGNOption),

  async execute(interaction) {
    const tier = interaction.options.getInteger('tier')!;

    await interaction.deferReply();

    const extractedUser = await extractUser(interaction);
    if (!extractedUser) return;

    const { name, server } = extractedUser;
    const command = `tanks ${server} ${name} ${tier}`;

    getBlitzAccount(interaction, command, name, server, async (account) => {
      getWargamingResponse<TanksStats>(
        `https://api.wotblitz.${server}/wotb/tanks/stats/?application_id=${args['wargaming-application-id']}&account_id=${account.account_id}`,
        interaction,
        command,
        async (tankStats) => {
          const tanks = tankStats[account.account_id]
            .map((tankData) => tankopedia.data[tankData.tank_id])
            .filter((tank) => tank.tier === tier);

          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle(
                  `${markdownEscape(account.nickname)}'s owned ${
                    tier === null ? '' : `tier ${tier} `
                  }tanks`,
                )
                .setDescription(
                  `${
                    tanks.length === 0
                      ? `No tanks found in tier ${tier}`
                      : tanks
                          .map(
                            (tank) =>
                              `${TANK_TYPE_EMOJIS[tank.type]} ${markdownEscape(
                                tank.name,
                              )} ${tank.is_premium ? '⭐' : ''}${
                                COMP_TANKS.includes(tank.tank_id) ? '🏆' : ''
                              }`,
                          )
                          .join('\n')
                  }\n\n**Legend**\n⭐ = Premium/Collector\n${
                    tier === 10 ? '🏆 = Comp Tank\n' : ''
                  }${TANK_TYPE_EMOJIS.heavyTank} = Heavy\n${
                    TANK_TYPE_EMOJIS.mediumTank
                  } = Medium\n${TANK_TYPE_EMOJIS.lightTank} = Light\n${
                    TANK_TYPE_EMOJIS['AT-SPG']
                  } = Tank Destroyer`,
                )
                .setColor(SKILLED_COLOR),
            ],
          });

          console.log(
            `Displaying ${account.nickname}'s owned tanks in tier ${tier}`,
          );
        },
      );
    });
  },
} satisfies CommandRegistry;
