import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import config from '../../config.json' assert { type: 'json' };

export async function execute(interaction: CommandInteraction) {
  const response = (await fetch(
    `https://api.wotblitz.${
      //@ts-ignore
      interaction.options.getString('server') === 'na'
        ? 'com'
        : //@ts-ignore
          interaction.options.getString('server')
    }/wotb/account/list/?application_id=${
      config.wargaming_application_id
      //@ts-ignore
    }&search=${interaction.options.getString('ign')}`,
  ).then((response) => response.json())) as {
    data: { nickname: string; account_id: number }[];
  };

  if (response.data.length === 1) {
    //@ts-ignore
    if (response.data[0].nickname === interaction.options.getString('ign')) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#82ff29')
            .setTitle(`${interaction.user.username} is verified`)
            .setDescription(
              `The user is now verified as ${
                //@ts-ignore
                interaction.options.getString('ign')
              }`,
            ),
        ],
      });
    } else {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ff4747')
            .setTitle(`Account not found`)
            .setDescription(
              //@ts-ignore
              `No exact matches were found for "${interaction.options.getString(
                'ign',
              )}" in the ${
                //@ts-ignore
                interaction.options.getString('server')
              } server. Are you sure you have no typos? Capitalization matters.`,
            ),
        ],
      });
    }
  } else {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#ff4747')
          .setTitle(`Account not found`)
          .setDescription(
            //@ts-ignore
            `Are you sure your username is "${interaction.options.getString(
              'ign',
            )}" in the ${
              //@ts-ignore
              interaction.options.getString('server')
            } server? I found ${
              response.data.length < 100 ? response.data.length : 'over 100'
            } accounts. Try re-running the command.`,
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
