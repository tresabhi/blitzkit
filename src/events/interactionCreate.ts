import {
  ActionRowBuilder,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Interaction,
  InteractionEditReplyOptions,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import discord from '../../discord.json' assert { type: 'json' };
import debug from '../commands/debug.js';
import eligible from '../commands/eligible.js';
import help from '../commands/help.js';
import inactive from '../commands/inactive.js';
import ownedtanks from '../commands/ownedtanks.js';
import ping from '../commands/ping.js';
import playerachievements from '../commands/playerachievements.js';
import playerinfo from '../commands/playerinfo.js';
import searchclans from '../commands/searchclans.js';
import searchplayers from '../commands/searchplayers.js';
import searchtanks from '../commands/searchtanks.js';
import stats from '../commands/stats.js';
import tankstats from '../commands/tankstats.js';
import today from '../commands/today.js';
import verify from '../commands/verify.js';
import negativeEmbed from '../core/interaction/negativeEmbed.js';
import warningEmbed from '../core/interaction/warningEmbed.js';
import { DISCORD_TOKEN } from '../core/process/args.js';
import getClientId from '../core/process/getClientId.js';
import isDev from '../core/process/isDev.js';
import { psa } from '../core/process/psa.js';
import render from '../core/ui/render.js';
import { handleError } from './error.js';

export type CommandReturnable = EmbedBuilder | ButtonBuilder | JSX.Element;
export type RichCommandReturnable = CommandReturnable | CommandReturnable[];

export type CommandRegistry = {
  inDevelopment: boolean;
  inProduction: boolean;
  inPublic: boolean;

  command: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  autocomplete?: (interaction: AutocompleteInteraction<CacheType>) => void;
} & (
  | {
      handlesInteraction?: false;
      execute: (
        interaction: ChatInputCommandInteraction<CacheType>,
      ) => RichCommandReturnable | Promise<RichCommandReturnable>;
    }
  | {
      handlesInteraction: true;
      execute: (interaction: ChatInputCommandInteraction<CacheType>) => void;
    }
);

const rest = new REST().setToken(DISCORD_TOKEN);

const commands = (
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
    stats,
    tankstats,
    today,
    verify,
    ping,
  ] as CommandRegistry[]
).reduce<Record<string, CommandRegistry>>((accumulator, registry) => {
  return { ...accumulator, [registry.command.name]: registry };
}, {});

export const guildCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
  [];
export const publicCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
  [];

Object.entries(commands).forEach(([, registry]) => {
  if (isDev() ? registry.inDevelopment : registry.inProduction) {
    if (registry.inPublic) {
      publicCommands.push(registry.command.toJSON());
    } else {
      guildCommands.push(registry.command.toJSON());
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
  Promise.all([
    rest.put(
      Routes.applicationGuildCommands(getClientId(), discord.sklld_guild_id),
      { body: guildCommands },
    ),
    rest.put(
      Routes.applicationGuildCommands(getClientId(), discord.tres_guild_id),
      { body: guildCommands },
    ),
  ]).then((guildData) => {
    console.log(
      `Successfully refreshed ${guildData.flat().length / 2} guild command(s).`,
    );
  });
} catch (error) {
  console.error(error);
}

export default async function interactionCreate(
  interaction: Interaction<CacheType>,
) {
  if (interaction.isAutocomplete()) {
    const command = commands[interaction.commandName];

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    if (command.autocomplete) command.autocomplete(interaction);
  } else if (interaction.isChatInputCommand()) {
    const command = commands[interaction.commandName];

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    const metadata = [
      `${interaction.user.id} (${interaction.user.username})`,
      `${interaction.guildId}/${interaction.channelId} (${interaction.guild?.name})`,
      new Date(),
    ];

    console.log(
      `${interaction.toString()}\n${metadata
        .map((item) => `  ${item}`)
        .join('\n')}`,
    );
    await interaction.deferReply();

    try {
      const result = await command.execute(interaction);

      if (command.handlesInteraction) return;

      const normalizedResult = Array.isArray(result) ? result : [result];
      const reply: InteractionEditReplyOptions = {};

      if (psa.data) {
        normalizedResult.push(
          warningEmbed(psa.data.title, psa.data.description),
        );
      }

      await Promise.all(
        normalizedResult.map(async (item) => {
          if (item instanceof EmbedBuilder) {
            if (!reply.embeds) reply.embeds = [];
            reply.embeds.push(item);
          } else if (item instanceof ButtonBuilder) {
            if (!reply.components)
              reply.components = [new ActionRowBuilder<ButtonBuilder>()];
            (
              reply.components[0] as ActionRowBuilder<ButtonBuilder>
            ).addComponents(item);
          } else {
            const image = await render(item!);
            if (!reply.files) reply.files = [];
            reply.files.push(image);
          }
        }),
      );

      await interaction.editReply(reply);
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
