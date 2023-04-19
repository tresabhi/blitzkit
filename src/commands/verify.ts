import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import config from '../../config.json' assert { type: 'json' };
import getBlitzURL from '../utilities/getBlitzURL.js';

export async function execute(interaction: CommandInteraction) {
  //@ts-ignore
  const ign = interaction.options.getString('ign');
  //@ts-ignore
  const server = interaction.options.getString('server');
  const blitzURL = getBlitzURL(server);
  const players = (await fetch(
    `${blitzURL}account/list/?application_id=${config.wargaming_application_id}&search=${ign}`,
  ).then((response) => response.json())) as {
    data: { nickname: string; account_id: number }[];
  };

  if (players.data[0].nickname === ign) {
    // good match
    const clan = (await fetch(
      `${blitzURL}clans/accountinfo/?application_id=${config.wargaming_application_id}&account_id=${players.data[0].account_id}&extra=clan`,
    ).then((response) => response.json())) as {
      data: { [key: number]: { clan: { tag: string } } };
    };

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#82ff29')
          .setTitle(`${interaction.user.username} is verified`)
          .setDescription(
            `The user is now verified as ${ign} [${
              clan.data[players.data[0].account_id].clan.tag
            }]`,
          ),
      ],
    });
  } else {
    // no exact match
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#ff4747')
          .setTitle(`Account not found`)
          .setDescription(
            `Are you sure your username is exactly "${ign}" in the ${server} server? I found ${
              players.data.length < 100 ? players.data.length : 'over 100'
            } account(s). Try re-running the command. There might be a typo and capitalization matters.`,
          ),
      ],
    });
  }
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
        { name: 'NA', value: 'na' },
        { name: 'EU', value: 'eu' },
        { name: 'ASIA', value: 'asia' },
      ),
  )
  .addStringOption((option) =>
    option
      .setName('ign')
      .setDescription('The username you use in Blitz')
      .setRequired(true),
  );
