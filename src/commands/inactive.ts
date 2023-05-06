import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { NEGATIVE_COLOR, POSITIVE_COLOR } from '../constants/colors.js';
import { BlitzServer } from '../constants/servers.js';
import { ClanInfo } from '../types/clanInfo.js';
import { PlayerPersonalData } from '../types/playerPersonalData.js';
import addServerChoices from '../utilities/addServerChoices.js';
import { args } from '../utilities/args.js';
import getClan from '../utilities/getClan.js';
import getWargamingResponse from '../utilities/getWargamingResponse.js';

const DEFAULT_THRESHOLD = 7;

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('inactive')
    .setDescription('Lists all inactive players')
    .addStringOption(addServerChoices)
    .addStringOption((option) =>
      option
        .setName('name')
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
    const name = interaction.options.getString('name')!;
    const server = interaction.options.getString('server') as BlitzServer;
    const command = `inactive ${server} ${name}`;

    getClan(interaction, command, name, server, async (clan) => {
      const threshold =
        interaction.options.getNumber('threshold')! ?? DEFAULT_THRESHOLD;
      const time = new Date().getTime() / 1000;

      getWargamingResponse<ClanInfo>(
        `https://api.wotblitz.${server}/wotb/clans/info/?application_id=${args['wargaming-application-id']}&clan_id=${clan.clan_id}`,
        interaction,
        command,
        async (clanInfo) => {
          const memberIds = clanInfo[clan.clan_id].members_ids;

          getWargamingResponse<PlayerPersonalData>(
            `https://api.wotblitz.${server}/wotb/account/info/?application_id=${
              args['wargaming-application-id']
            }&account_id=${memberIds.join(',')}`,
            interaction,
            command,
            async (playerPersonalData) => {
              const inactiveInfo = memberIds
                .map((memberId) => {
                  const member = playerPersonalData[memberId];
                  const inactiveDays =
                    (time - member.last_battle_time) / 60 / 60 / 24;

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
                    .setColor(
                      hasInactiveMembers ? NEGATIVE_COLOR : POSITIVE_COLOR,
                    )
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
          );
        },
      );
    });
  },
} satisfies CommandRegistry;
