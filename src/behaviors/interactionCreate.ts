import {
  CacheType,
  ChatInputCommandInteraction,
  Collection,
  Interaction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from 'discord.js';

export interface CommandSet {
  commandCollection: Collection<string, CommandRegistry>;
  guildCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[];
  publicCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[];
}

export interface CommandRegistry {
  inDevelopment: boolean; // register with Skilled Bot (default: false)
  inProduction: boolean; // register with Skilled Canary (default: false)
  inPublic: boolean; // registers on all servers (default: true)

  command: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (
    interaction: ChatInputCommandInteraction<CacheType>,
    commandSed: CommandSet,
  ) => void;
}

export default function interactionCreateCurry(commandSet: CommandSet) {
  return async function interactionCreate(interaction: Interaction<CacheType>) {
    if (!interaction.isChatInputCommand()) return;
    const command = commandSet.commandCollection.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    try {
      command.execute(interaction, commandSet);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  };
}
