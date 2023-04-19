import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export function execute(interaction: CommandInteraction) {
  interaction.reply(
    //@ts-ignore
    `you said your blitz username was ${interaction.options.getString(
      'ign',
    )} in ${
      //@ts-ignore
      interaction.options.getString('server')
    }`,
  );
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
