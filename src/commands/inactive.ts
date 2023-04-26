import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { NEGATIVE_COLOR, POSITIVE_COLOR } from '../constants/colors.js';
import { BLITZ_SERVERS, BlitzServer } from '../constants/servers.js';
import { ClanDetails } from '../types/clanDetails.js';
import { PlayerPersonalData } from '../types/playerPersonalData.js';
import getClan from '../utilities/getClan.js';

const DEFAULT_THRESHOLD = 7;

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('inactive')
    .setDescription('Lists all inactive players')
    .addStringOption((option) =>
      option
        .setName('server')
        .setDescription('The Blitz server you are in')
        .setRequired(true)
        .addChoices(
          { name: BLITZ_SERVERS.com, value: 'com' },
          { name: BLITZ_SERVERS.eu, value: 'eu' },
          { name: BLITZ_SERVERS.asia, value: 'asia' },
        ),
    )
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

    getClan(interaction, name, server, async (clan) => {
      const threshold =
        interaction.options.getNumber('threshold')! ?? DEFAULT_THRESHOLD;
      const time = new Date().getTime() / 1000;
      const clanData = (await (
        await fetch(
          `https://api.wotblitz.com/wotb/clans/info/?application_id=${process.env.WARGAMING_APPLICATION_ID}&clan_id=${clan.clan_id}`,
        )
      ).json()) as ClanDetails;
      const memberIds = clanData.data[clan.clan_id].members_ids;
      const playerPersonalData = (await (
        await fetch(
          `https://api.wotblitz.com/wotb/account/info/?application_id=${
            process.env.WARGAMING_APPLICATION_ID
          }&account_id=${memberIds.join(',')}`,
        )
      ).json()) as PlayerPersonalData;

      const inactiveInfo = memberIds
        .map((memberId) => {
          const member = playerPersonalData.data[memberId];
          const inactiveDays = (time - member.last_battle_time) / 60 / 60 / 24;

          return [member.nickname, inactiveDays] as const;
        })
        .filter(([, inactiveDays]) => inactiveDays >= threshold)
        .sort((a, b) => b[1] - a[1])
        .map(([nickname, inactiveDays]) => {
          const days = Math.floor(inactiveDays);
          return `**${nickname}**: ${days} day${days === 1 ? '' : 's'}`;
        });
      const hasInactiveMembers = inactiveInfo.length > 0;

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(hasInactiveMembers ? NEGATIVE_COLOR : POSITIVE_COLOR)
            .setTitle(
              hasInactiveMembers
                ? `${clan.name}'s inactive members`
                : `No inactive members in ${clan.name}`,
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
    });
  },
} satisfies CommandRegistry;
