import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { NEGATIVE_COLOR, POSITIVE_COLOR } from '../constants/colors.js';
import { BlitzServer } from '../constants/servers.js';
import getClan from '../core/blitz/getClan.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import cmdName from '../core/interaction/cmdName.js';
import addServerChoices from '../core/options/addServerChoices.js';
import { args } from '../core/process/args.js';
import { AccountInfo } from '../types/accountInfo.js';
import { ClanInfo } from '../types/clanInfo.js';
import { Clan } from '../types/clanList.js';

const DEFAULT_THRESHOLD = 7;

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('inactive'))
    .setDescription('Lists all inactive players')
    .addStringOption(addServerChoices)
    .addStringOption((option) =>
      option
        .setName('clan')
        .setDescription('The clan name or tag you are checking')
        .setRequired(true),
    )
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
    const server = interaction.options.getString('server') as BlitzServer;

    const clan = (await getClan(interaction, clanName, server)) as Clan;
    if (!clan) return;

    const threshold =
      interaction.options.getNumber('threshold')! ?? DEFAULT_THRESHOLD;
    const time = new Date().getTime() / 1000;
    const clanInfo = await getWargamingResponse<ClanInfo>(
      `https://api.wotblitz.${server}/wotb/clans/info/?application_id=${args['wargaming-application-id']}&clan_id=${clan.clan_id}`,
    );
    if (!clanInfo) return;
    const memberIds = clanInfo[clan.clan_id].members_ids;
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
              ? `${markdownEscape(clan.name)}'s inactive members`
              : `No inactive members in ${markdownEscape(clan.name)}`,
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
      `Displaying inactive members in ${clan.name} for ${threshold} days`,
    );
  },
} satisfies CommandRegistry;
