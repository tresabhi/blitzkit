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
import debug from '../../commands/debug.js';
import eligible from '../../commands/eligible.js';
import evolution from '../../commands/evolution.js';
import help from '../../commands/help.js';
import inactive from '../../commands/inactive.js';
import ownedtanks from '../../commands/ownedtanks.js';
import ping from '../../commands/ping.js';
import playerachievements from '../../commands/playerachievements.js';
import playerinfo from '../../commands/playerinfo.js';
import searchclans from '../../commands/searchclans.js';
import searchplayers from '../../commands/searchplayers.js';
import searchtanks from '../../commands/searchtanks.js';
import statsfull from '../../commands/statsfull.js';
import today from '../../commands/today.js';
import verify from '../../commands/verify.js';
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
    debug,
    eligible,
    help,
    inactive,
    ownedtanks,
    playerachievements,
    playerinfo,
    searchclans,
    searchplayers,
    searchtanks,
    statsfull,
    today,
    verify,
    ping,
    evolution,
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
