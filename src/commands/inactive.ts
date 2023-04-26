import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { NEGATIVE_COLOR, POSITIVE_COLOR } from '../constants/colors.js';
import { ClanDetails } from '../types/clanDetails.js';
import { PlayerPersonalData } from '../types/playerPersonalData.js';
import { CLANS } from './eligible.js';

const DEFAULT_THRESHOLD = 7;

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: false,

  command: new SlashCommandBuilder()
    .setName('inactive')
    .setDescription('Lists all inactive players')
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
    .addNumberOption((option) =>
      option
        .setName('threshold')
        .setDescription(
          `The number of days inactive (default: ${DEFAULT_THRESHOLD})`,
        )
        .setMinValue(0),
    ),

  async execute(interaction) {
    const threshold =
      interaction.options.getNumber('threshold')! ?? DEFAULT_THRESHOLD;
    const time = new Date().getTime() / 1000;
    const clanName = interaction.options.getString(
      'clan',
    ) as keyof typeof CLANS;
    const clanData = (await (
      await fetch(
        `https://api.wotblitz.com/wotb/clans/info/?application_id=${process.env.WARGAMING_APPLICATION_ID}&clan_id=${CLANS[clanName].id}`,
      )
    ).json()) as ClanDetails;
    const clan = clanData.data[CLANS[clanName].id];
    const memberIds = clan.members_ids;
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
              ? `${CLANS[clanName].name}'s inactive members`
              : `No inactive members in ${CLANS[clanName].name}`,
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
      `Displaying inactive members in ${CLANS[clanName].name} for ${threshold} days`,
    );
  },
} satisfies CommandRegistry;
