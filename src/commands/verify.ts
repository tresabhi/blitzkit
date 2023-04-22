import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import fetch from 'node-fetch';
import discord from '../../discord.json' assert { type: 'json' };
import { NEGATIVE_COLOR, POSITIVE_COLOR } from '../constants/colors.js';
import { SERVERS } from '../constants/servers.js';
import getBlitzAccount from '../utilities/getBlitzAccount.js';

export async function execute(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const ign = interaction.options.getString('ign')!;
  const server = interaction.options.getString(
    'server',
  ) as keyof typeof SERVERS;

  getBlitzAccount(interaction, ign, server, async (account) => {
    // good match
    const clanData = (await fetch(
      `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${process.env.WARGAMING_APPLICATION_ID}&account_id=${account.account_id}&extra=clan`,
    ).then((response) => response.json())) as {
      data: { [key: number]: { clan: { tag: string } | null } };
    };
    const clan = clanData.data[account.account_id].clan;
    const clanTag = clan === null ? '' : ` [${clan.tag}]`;

    if (interaction.member && interaction.guild) {
      const member = interaction.guild?.members.cache.get(
        interaction.member?.user.id,
      );

      member
        ?.setNickname(`${ign}${clanTag}`)
        .then(async () => {
          await member.roles.remove(discord.verify_role);
          await member.roles.add(discord.peasant_role);
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(POSITIVE_COLOR)
                .setTitle(`${interaction.user.username} is verified`)
                .setDescription(`The user is now verified as ${ign}${clanTag}`),
            ],
          });

          console.log(
            `${interaction.user.username} verified as ${ign}${clanTag}`,
          );
        })
        .catch(async () => {
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(NEGATIVE_COLOR)
                .setTitle(`${interaction.user.username} failed to verify`)
                .setDescription(
                  'I may not have the permission to change your nickname.',
                ),
            ],
          });

          console.warn(
            `${interaction.user.username} failed to verify as ${ign}${clanTag}`,
          );
        });
    }
  });
}

export const data = new SlashCommandBuilder()
  .setName('verify')
  .setDescription('Verifies the user with Blitz')
  .addStringOption((option) =>
    option
      .setName('server')
      .setDescription('The Blitz server you are in')
      .setRequired(true)
      .addChoices(
        { name: SERVERS.com, value: 'com' },
        { name: SERVERS.eu, value: 'eu' },
        { name: SERVERS.asia, value: 'asia' },
      ),
  )
  .addStringOption((option) =>
    option
      .setName('ign')
      .setDescription('The username you use in Blitz')
      .setRequired(true),
  );
