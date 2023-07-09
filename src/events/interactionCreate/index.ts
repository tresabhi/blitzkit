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
import { debugCommand } from '../../commands/debug.js';
import { eligibleCommand } from '../../commands/eligible.js';
import { evolutionCommand } from '../../commands/evolution.js';
import { helpCommand } from '../../commands/help.js';
import { inactiveCommand } from '../../commands/inactive.js';
import { ownedTanksCommand } from '../../commands/ownedTanks.js';
import { pingCommand } from '../../commands/ping.js';
import { playerAchievementsCommand } from '../../commands/playerAchievements.js';
import { playerInfoCommand } from '../../commands/playerInfo.js';
import { searchClansCommand } from '../../commands/searchClans.js';
import { searchPlayersCommand } from '../../commands/searchPlayers.js';
import { searchTanksCommand } from '../../commands/searchTanks.js';
import { statsCommand } from '../../commands/stats.js';
import { fullStatsCommand } from '../../commands/fullStats.js';
import { todayCommand } from '../../commands/today.js';
import { verifyCommand } from '../../commands/verify.js';
import { DISCORD_TOKEN } from '../../core/node/arguments.js';
import getClientId from '../../core/node/getClientId.js';
import isDev from '../../core/node/isDev.js';
import handleAutocomplete from './handlers/autocomplete.js';
import handleButton from './handlers/button.js';
import handleChatInputCommand from './handlers/chatInputCommand.js';

export type InteractionRawReturnable =
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
  inDevelopment: boolean;
  inProduction: boolean;
}

export interface CommandRegistry<HandlesInteraction extends boolean = boolean>
  extends Registry {
  inPublic: boolean;
  handlesInteraction?: HandlesInteraction;
  command:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

  handler: (
    interaction: ChatInputCommandInteraction<CacheType>,
  ) => HandlesInteraction extends true ? void : InteractionReturnable;
  autocomplete?: (interaction: AutocompleteInteraction<CacheType>) => void;
  button?: (interaction: ButtonInteraction<CacheType>) => InteractionReturnable;
}

const rest = new REST().setToken(DISCORD_TOKEN);

export const commands: Record<string, CommandRegistry> = (
  [
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
  ] as CommandRegistry[]
).reduce((accumulator, registry) => {
  if (isDev()) registry.command.setDefaultMemberPermissions(0);
  return { ...accumulator, [registry.command.name]: registry };
}, {});

export const guildCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
  [];
export const publicCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
  [];

Object.entries(commands).forEach(([, registry]) => {
  if (isDev() ? registry.inDevelopment : registry.inProduction) {
    const json = registry.command.toJSON();

    if (registry.inPublic) {
      publicCommands.push(json);
    } else {
      guildCommands.push(json);
    }
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
