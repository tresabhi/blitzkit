import {
  ActionRowBuilder,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  Collection,
  Interaction,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';
import { readdirSync } from 'fs';
import discord from '../../discord.json' assert { type: 'json' };
import negativeEmbed from '../core/interaction/negativeEmbed.js';
import { discordToken } from '../core/process/args.js';
import getClientId from '../core/process/getClientId.js';
import isDev from '../core/process/isDev.js';
import { handleError } from './error.js';

export interface CommandRegistry {
  inDevelopment: boolean;
  inProduction: boolean;
  inPublic: boolean;

  command: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (interaction: ChatInputCommandInteraction<CacheType>) => void;
  autocomplete?: (interaction: AutocompleteInteraction<CacheType>) => void;
}

const rest = new REST().setToken(discordToken);

const commandFolders = readdirSync('src/commands/');
const commandCollection = new Collection<string, CommandRegistry>();
export const guildCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
  [];
export const publicCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
  [];

for (const file of commandFolders) {
  const command = (await import(`../commands/${file}`))
    .default as CommandRegistry;

  if (isDev() ? command.inDevelopment : command.inProduction) {
    if (command.inPublic) {
      publicCommands.push(command.command.toJSON());
    } else {
      guildCommands.push(command.command.toJSON());
    }

    commandCollection.set(command.command.name, command);
  }
}

try {
  console.log(`Refreshing ${publicCommands.length} public command(s).`);
  const publicData = (await rest.put(
    Routes.applicationCommands(getClientId()),
    { body: publicCommands },
  )) as RESTPostAPIChatInputApplicationCommandsJSONBody[];
  console.log(`Successfully refreshed ${publicData.length} public command(s).`);

  console.log(`Refreshing ${guildCommands.length} guild command(s).`);
  const guildData = [
    ...((await rest.put(
      Routes.applicationGuildCommands(getClientId(), discord.sklld_guild_id),
      { body: guildCommands },
    )) as RESTPostAPIChatInputApplicationCommandsJSONBody[]),
    ...((await rest.put(
      Routes.applicationGuildCommands(getClientId(), discord.tres_guild_id),
      { body: guildCommands },
    )) as RESTPostAPIChatInputApplicationCommandsJSONBody[]),
  ];
  console.log(
    `Successfully refreshed ${guildData.length / 2} guild command(s).`,
  );
} catch (error) {
  console.error(error);
}

export default async function interactionCreate(
  interaction: Interaction<CacheType>,
) {
  if (interaction.isAutocomplete()) {
    const command = commandCollection.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    if (command.autocomplete) command.autocomplete(interaction);
  } else if (interaction.isChatInputCommand()) {
    const command = commandCollection.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    console.log(interaction.toString());
    await interaction.deferReply();

    try {
      await command.execute(interaction);
    } catch (error) {
      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('Get Help on Discord Server')
          .setURL('https://discord.gg/nDt7AjGJQH')
          .setStyle(ButtonStyle.Link),
      );

      await interaction.editReply({
        embeds: [
          negativeEmbed(
            (error as Error).message,
            `${
              (error as Error).cause ?? 'No further information is available.'
            }`,
          ),
        ],
        components: [actionRow],
      });

      handleError(error as Error, interaction.commandName);
    }
  }
}
