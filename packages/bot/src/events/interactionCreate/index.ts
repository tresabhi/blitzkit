import {
  AttachmentBuilder,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonInteraction,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Interaction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { RenderConfiguration } from '../../core/blitzkit/renderConfiguration';
import { handleAutocomplete } from './handlers/autocomplete';
import { handleChatInputCommand } from './handlers/chatInputCommand';

export type InteractionRawReturnable =
  | string
  | EmbedBuilder
  | ButtonBuilder
  | AttachmentBuilder
  | RenderConfiguration
  | JSX.Element
  | null;
export type InteractionIterableReturnable =
  | InteractionRawReturnable
  | InteractionRawReturnable[];
export type InteractionReturnable =
  | InteractionIterableReturnable
  | Promise<InteractionIterableReturnable>;

interface CommandRegistryBase {
  command:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

  autocomplete?: (interaction: AutocompleteInteraction<CacheType>) => void;
  button?: (interaction: ButtonInteraction<CacheType>) => InteractionReturnable;
}

interface CommandRegistryImplicit extends CommandRegistryBase {
  handlesInteraction: true;
  handler: (interaction: ChatInputCommandInteraction<CacheType>) => void;
}

interface CommandRegistryExplicit extends CommandRegistryBase {
  handlesInteraction?: false;
  handler: (
    interaction: ChatInputCommandInteraction<CacheType>,
  ) => InteractionReturnable;
}

export type CommandRegistry = CommandRegistryImplicit | CommandRegistryExplicit;

export const COMMANDS_RAW: Promise<CommandRegistry>[] = [
  // auctionCommand,
  // permissionsCommand,
  // debugCommand,
  // aboutCommand,
  // inactiveCommand,
  // ownedTanksCommand,
  // playerInfoCommand,
  // searchClansCommand,
  // searchPlayersCommand,
  // fullStatsCommand,
  // breakdownCommand,
  // verifyCommand,
  // pingCommand,
  // evolutionCommand,
  // statsCommand,
  // ratingLeaderboardCommand,
  // todayCommand,
  // researchCommand,
  // ratingCommand,
  // replayCommand,
];

export const commands = Promise.allSettled(COMMANDS_RAW).then((rawCommands) => {
  // return rawCommands.reduce<Record<string, CommandRegistry>>(
  //   (commands, registry, index) => {
  //     if (registry.status === 'rejected') {
  //       console.warn(
  //         `Command ${index} failed to load; skipping...`,
  //         registry.reason,
  //       );
  //       return commands;
  //     }
  //     return { ...commands, [registry.value.command.name]: registry.value };
  //   },
  //   {},
  // );
});

// const rest = new REST().setToken(assertSecret(import.meta.env.DISCORD_TOKEN));

// commands.then((awaitedCommands) => {
//   const body = Object.values(awaitedCommands).map((registry) =>
//     registry.command.toJSON(),
//   );

//   rest.put(
//     Routes.applicationCommands(assertSecret(import.meta.env.DISCORD_CLIENT_ID)),
//     { body },
//   );
// });

export async function interactionCreate(interaction: Interaction<CacheType>) {
  if (interaction.isAutocomplete()) {
    handleAutocomplete(interaction);
  } else if (interaction.isChatInputCommand()) {
    handleChatInputCommand(interaction);
  } else if (interaction.isButton()) {
    // handleButton(interaction);
  }
}
