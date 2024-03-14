import {
  AttachmentBuilder,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonInteraction,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Interaction,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import discord from '../../../discord.json' assert { type: 'json' };
import { aboutCommand } from '../../commands/about';
import { breakdownCommand } from '../../commands/breakdown';
import { debugCommand } from '../../commands/debug';
import { evolutionCommand } from '../../commands/evolution';
import { fullStatsCommand } from '../../commands/fullStats';
import { inactiveCommand } from '../../commands/inactive';
import { verifyCommand } from '../../commands/link';
import { ownedTanksCommand } from '../../commands/ownedTanks';
import { permissionsCommand } from '../../commands/permissions';
import { pingCommand } from '../../commands/ping';
import { playerInfoCommand } from '../../commands/playerInfo';
import { ratingsCommand } from '../../commands/ratings';
import { researchCommand } from '../../commands/research';
import { searchClansCommand } from '../../commands/searchClans';
import { searchPlayersCommand } from '../../commands/searchPlayers';
import { statsCommand } from '../../commands/stats';
import { todayCommand } from '../../commands/today';
import getClientId from '../../core/blitzkrieg/getClientId';
import isDev from '../../core/blitzkrieg/isDev';
import { secrets } from '../../core/blitzkrieg/secrets';
import handleAutocomplete from './handlers/autocomplete';
import handleButton from './handlers/button';
import handleChatInputCommand from './handlers/chatInputCommand';

export type InteractionRawReturnable =
  | string
  | EmbedBuilder
  | ButtonBuilder
  | AttachmentBuilder
  | JSX.Element
  | null;
export type InteractionIterableReturnable =
  | InteractionRawReturnable
  | InteractionRawReturnable[];
export type InteractionReturnable =
  | InteractionIterableReturnable
  | Promise<InteractionIterableReturnable>;

interface CommandRegistryBase {
  inProduction: boolean;
  inPublic: boolean;

  command:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
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
  permissionsCommand,
  debugCommand,
  aboutCommand,
  inactiveCommand,
  ownedTanksCommand,
  playerInfoCommand,
  searchClansCommand,
  searchPlayersCommand,
  fullStatsCommand,
  breakdownCommand,
  verifyCommand,
  pingCommand,
  evolutionCommand,
  statsCommand,
  ratingsCommand,
  todayCommand,
  researchCommand,
];

export const commands = Promise.allSettled(COMMANDS_RAW).then((rawCommands) => {
  return rawCommands.reduce<Record<string, CommandRegistry>>(
    (commands, registry, index) => {
      if (registry.status === 'rejected') {
        console.warn(
          `Command ${index} failed to load; skipping...`,
          registry.reason,
        );

        return commands;
      }
      if (isDev()) registry.value.command.setDefaultMemberPermissions(0);
      return { ...commands, [registry.value.command.name]: registry.value };
    },
    {},
  );
});

const rest = new REST().setToken(secrets.DISCORD_TOKEN);
export const guildCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
  [];
export const publicCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
  [];

commands.then((awaitedCommands) => {
  Object.values(awaitedCommands).forEach((registry) => {
    const json = registry.command.toJSON();

    if (registry.inPublic) {
      publicCommands.push(json);
    } else {
      guildCommands.push(json);
    }
  });

  try {
    rest.put(Routes.applicationCommands(getClientId()), {
      body: publicCommands,
    });

    (isDev()
      ? [discord.test_guild_id]
      : [discord.tres_guild_id, discord.sklld_guild_id]
    ).forEach((guildId) =>
      rest.put(Routes.applicationGuildCommands(getClientId(), guildId), {
        body: guildCommands,
      }),
    );
  } catch (error) {
    console.error(error);
  }
});

export default async function interactionCreate(
  interaction: Interaction<CacheType>,
) {
  if (interaction.isAutocomplete()) {
    handleAutocomplete(interaction);
  } else if (interaction.isChatInputCommand()) {
    handleChatInputCommand(interaction);
  } else if (interaction.isButton()) {
    handleButton(interaction);
  }
}
