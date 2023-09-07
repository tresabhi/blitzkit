import {
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
import { clanEventCommand } from '../../commands/clanEvent';
import { debugCommand } from '../../commands/debug';
import { eligibleCommand } from '../../commands/eligible';
import { evolutionCommand } from '../../commands/evolution';
import { fullStatsCommand } from '../../commands/fullStats';
import { helpCommand } from '../../commands/help';
import { inactiveCommand } from '../../commands/inactive';
import { ownedTanksCommand } from '../../commands/ownedTanks';
import { pingCommand } from '../../commands/ping';
import { playerAchievementsCommand } from '../../commands/playerAchievements';
import { playerInfoCommand } from '../../commands/playerInfo';
import { ratingsCommand } from '../../commands/ratings';
import { searchClansCommand } from '../../commands/searchClans';
import { searchPlayersCommand } from '../../commands/searchPlayers';
import { searchTanksCommand } from '../../commands/searchTanks';
import { statsCommand } from '../../commands/stats';
import { todayCommand } from '../../commands/today';
import { verifyCommand } from '../../commands/verify';
import getClientId from '../../core/node/getClientId';
import isDev from '../../core/node/isDev';
import { secrets } from '../../core/node/secrets';
import handleAutocomplete from './handlers/autocomplete';
import handleButton from './handlers/button';
import handleChatInputCommand from './handlers/chatInputCommand';

export type InteractionRawReturnable =
  | string
  | EmbedBuilder
  | ButtonBuilder
  | JSX.Element;
export type InteractionIterableReturnable =
  | InteractionRawReturnable
  | InteractionRawReturnable[];
export type InteractionReturnable =
  | InteractionIterableReturnable
  | Promise<InteractionIterableReturnable>;

export interface Registry {
  inProduction: boolean;
}

export type CommandRegistryRaw = Registry & {
  inPublic: boolean;
  inPreview?: boolean;

  command:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

  autocomplete?: (interaction: AutocompleteInteraction<CacheType>) => void;
  button?: (interaction: ButtonInteraction<CacheType>) => InteractionReturnable;
} & (
    | {
        handlesInteraction: true;
        handler: (interaction: ChatInputCommandInteraction<CacheType>) => void;
      }
    | {
        handlesInteraction?: false;
        handler: (
          interaction: ChatInputCommandInteraction<CacheType>,
        ) => InteractionReturnable;
      }
  );
export type CommandRegistry = CommandRegistryRaw | Promise<CommandRegistryRaw>;

const rest = new REST().setToken(secrets.DISCORD_TOKEN);

export const COMMANDS_RAW: CommandRegistry[] = [
  debugCommand,
  eligibleCommand,
  helpCommand,
  inactiveCommand,
  ownedTanksCommand,
  playerAchievementsCommand,
  playerInfoCommand,
  searchClansCommand,
  searchPlayersCommand,
  searchTanksCommand,
  fullStatsCommand,
  todayCommand,
  verifyCommand,
  pingCommand,
  evolutionCommand,
  statsCommand,
  ratingsCommand,
  clanEventCommand,
];

export const commands = Promise.all(COMMANDS_RAW).then((rawCommands) =>
  rawCommands.reduce<Record<string, CommandRegistryRaw>>(
    (accumulator, registry) => {
      if (isDev()) registry.command.setDefaultMemberPermissions(0);

      return {
        ...accumulator,
        [registry.command.name]: registry,
      };
    },
    {},
  ),
);

export const guildCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
  [];
export const publicCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
  [];

commands.then((awaitedCommands) => {
  Object.entries(awaitedCommands).forEach(([, registry]) => {
    const json = registry.command.toJSON();

    if (registry.inPublic) {
      publicCommands.push(json);
    } else {
      guildCommands.push(json);
    }
  });

  try {
    console.log(`Refreshing ${publicCommands.length} public command(s).`);
    rest
      .put(Routes.applicationCommands(getClientId()), { body: publicCommands })
      .then((publicData) => {
        console.log(
          `Successfully refreshed ${
            (publicData as RESTPostAPIChatInputApplicationCommandsJSONBody[])
              .length
          } public command(s).`,
        );
      });

    console.log(`Refreshing ${guildCommands.length} guild command(s).`);
    rest
      .put(
        Routes.applicationGuildCommands(getClientId(), discord.tres_guild_id),
        { body: guildCommands },
      )
      .then((guildData) => {
        console.log(
          `Successfully refreshed ${
            (guildData as unknown[]).length
          } guild command(s).`,
        );
      });
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
