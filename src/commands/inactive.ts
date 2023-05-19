import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { NEGATIVE_COLOR, POSITIVE_COLOR } from '../constants/colors.js';
import clanAutocomplete from '../core/autocomplete/clan.js';
import getBlitzClan from '../core/blitz/getBlitzClan.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import cmdName from '../core/interaction/cmdName.js';
import addClanOption from '../core/options/addClanOption.js';
import { args } from '../core/process/args.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo } from '../types/accountInfo.js';
import { ClanInfo } from '../types/clanInfo.js';

const DEFAULT_THRESHOLD = 7;

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('inactive'))
    .setDescription('Lists all inactive players')
    .addStringOption(addClanOption)
    .addNumberOption((option) =>
      option
        .setName('threshold')
        .setDescription(
          `The number of days inactive (default: ${DEFAULT_THRESHOLD})`,
        )
        .setMinValue(0),
    ),

  async execute(interaction) {
    const clanName = interaction.options.getString('clan')!;
    const clan = await getBlitzClan(interaction, clanName);
    if (!clan) return;
    const { server, id } = clan;

    const threshold =
      interaction.options.getNumber('threshold')! ?? DEFAULT_THRESHOLD;
    const time = new Date().getTime() / 1000;
    const clanInfo = await getWargamingResponse<ClanInfo>(
      `https://api.wotblitz.${server}/wotb/clans/info/?application_id=${args['wargaming-application-id']}&clan_id=${id}`,
    );
    if (!clanInfo) return;
    const memberIds = clanInfo[id].members_ids;
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${
        args['wargaming-application-id']
      }&account_id=${memberIds.join(',')}`,
    );
    if (!accountInfo) return;
    const inactiveInfo = memberIds
      .map((memberId) => {
        const member = accountInfo[memberId];
        const inactiveDays = (time - member.last_battle_time) / 60 / 60 / 24;

        return [member.nickname, inactiveDays] as const;
      })
      .filter(([, inactiveDays]) => inactiveDays >= threshold)
      .sort((a, b) => b[1] - a[1])
      .map(([nickname, inactiveDays]) => {
        const days = Math.floor(inactiveDays);
        return `**${markdownEscape(nickname)}**: ${days} day${
          days === 1 ? '' : 's'
        }`;
      });
    const hasInactiveMembers = inactiveInfo.length > 0;

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(hasInactiveMembers ? NEGATIVE_COLOR : POSITIVE_COLOR)
          .setTitle(
            hasInactiveMembers
              ? `${markdownEscape(clanInfo[id].name)}'s inactive members`
              : `No inactive members in ${markdownEscape(clanInfo[id].name)}`,
          )
          .setDescription(
            hasInactiveMembers
              ? `Players that exceed the threshold of ${threshold} days:\n\n${inactiveInfo.join(
                  '\n',
                )}`
              : `No players exceed the threshold of ${threshold} days.`,
          ),
      ],
    });

    console.log(
      `Displaying inactive members in ${clanInfo[id].name} for ${threshold} days`,
    );
  },

  autocomplete: clanAutocomplete,
} satisfies CommandRegistry;
