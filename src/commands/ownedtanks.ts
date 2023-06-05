import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getTankStats from '../core/blitz/getTankStats.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import resolveTankName from '../core/blitz/resolveTankName.js';
import { TANK_TYPE_EMOJIS, tankopedia } from '../core/blitz/tankopedia.js';
import cmdName from '../core/interaction/cmdName.js';
import infoEmbed from '../core/interaction/infoEmbed.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { args } from '../core/process/args.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo } from '../types/accountInfo.js';

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
    .setName(cmdName('ownedtanks'))
    .setDescription("Shows a player's owned tanks")
    .addIntegerOption((option) =>
      option
        .setName('tier')
        .setDescription('The tier you want to see')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(true),
    )
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    const tier = interaction.options.getInteger('tier')!;
    const account = await getBlitzAccount(interaction);
    const { id, server } = account;
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${args['wargaming-application-id']}&account_id=${id}`,
    );
    const tankStats = await getTankStats(interaction, server, id);
    const tanks = tankStats
      .map((tankData) => tankopedia[tankData.tank_id])
      .filter((tank) => tank?.tier === tier);

    await interaction.editReply({
      embeds: [
        infoEmbed(
          `${markdownEscape(accountInfo[id].nickname)}'s owned ${
            tier === null ? '' : `tier ${tier} `
          }tanks`,
          `${
            tanks.length === 0
              ? `No tanks found in tier ${tier}`
              : tanks
                  .map(
                    (tank) =>
                      `${TANK_TYPE_EMOJIS[tank.type]} ${markdownEscape(
                        resolveTankName(tank.tank_id),
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
        ),
      ],
    });
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
