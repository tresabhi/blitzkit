import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { SKILLED_COLOR } from '../constants/colors.js';
import { BlitzServer } from '../constants/servers.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import validateUsername from '../core/blitz/validateUsername.js';
import { TANK_TYPE_EMOJIS, tankopedia } from '../core/blitzstars/tankopedia.js';
import cmdName from '../core/interaction/cmdName.js';
import addServerChoices from '../core/options/addServerChoices.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { args } from '../core/process/args.js';
import { TanksStats } from '../types/tanksStats.js';
import resolveTankName from '../utilities/resolveTankName.js';

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
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('tanks'))
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
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    const tier = interaction.options.getInteger('tier')!;
    const name = interaction.options.getString('username')!;
    const server = interaction.options.getString('server') as BlitzServer;
    const account = await validateUsername(interaction, name, server);
    if (!account) return;
    const tankStats = await getWargamingResponse<TanksStats>(
      `https://api.wotblitz.${server}/wotb/tanks/stats/?application_id=${args['wargaming-application-id']}&account_id=${account.account_id}`,
    );
    if (!tankStats) return;
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
                        `${TANK_TYPE_EMOJIS[tank.type]} ${resolveTankName(
                          tank,
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

    console.log(`Displaying ${account.nickname}'s owned tanks in tier ${tier}`);
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
