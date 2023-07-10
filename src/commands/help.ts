import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import embedInfo from '../core/discord/embedInfo.js';
import {
  COMMANDS_RAW,
  CommandRegistry,
} from '../events/interactionCreate/index.js';

const RAW_PATH = `https://raw.githubusercontent.com/tresabhi/blitzkrieg/main/docs/`;
const DOCS: Record<string, string> = {
  permissions: 'guide/permissions',
  embeds: 'guide/embeds',
  about: 'guide/about',
  invite: 'guide/invite',
};

export const helpCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('help')
    .setDescription('All the help you need about the bot')
    .addSubcommand((option) =>
      option
        .setName('commands')
        .setDescription('List of all commands and their descriptions'),
    )
    .addSubcommand((option) =>
      option
        .setName('permissions')
        .setDescription('The permissions needed for the bot to function'),
    )
    .addSubcommand((option) =>
      option.setName('about').setDescription('About the bot'),
    )
    .addSubcommand((option) =>
      option.setName('embeds').setDescription('How embeds work'),
    )
    .addSubcommand((option) =>
      option.setName('invite').setDescription('How to invite the bot'),
    ),

  handler(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'commands') {
      return [
        `# Commands\n\nBlitzkrieg offers the following commands:`,
        embedInfo(
          '',
          COMMANDS_RAW.filter(
            (registry) => registry.inPublic && registry.inProduction,
          )
            .map((registry) => {
              const info = `- \`/${registry.command.name}\`: ${registry.command.description}`;
              const subcommandGroups = registry.command.options.filter(
                (option) =>
                  option instanceof SlashCommandSubcommandGroupBuilder,
              ) as SlashCommandSubcommandGroupBuilder[];
              const subcommands = registry.command.options.filter(
                (option) => option instanceof SlashCommandSubcommandBuilder,
              ) as SlashCommandSubcommandBuilder[];

              const tree =
                subcommandGroups.length > 0
                  ? subcommandGroups
                      .map((subcommandGroup) => {
                        const info = `  - \`${subcommandGroup.name}\`: ${subcommandGroup.description}`;
                        const subcommands = subcommandGroup.options
                          .map(
                            (subcommand) =>
                              `    - \`${subcommand.name}\`: ${subcommand.description}`,
                          )
                          .join('\n');

                        return `${info}${
                          subcommands ? `\n${subcommands}` : ''
                        }`;
                      })
                      .join('\n')
                  : subcommands
                      .map(
                        (subcommand) =>
                          `  - \`${subcommand.name}\`: ${subcommand.description}`,
                      )
                      .join('\n');

              return `${info}${tree ? `\n${tree}` : ''}`;
            })
            .join('\n'),
        ),
      ];
    }

    const url = `${RAW_PATH}${DOCS[subcommand]}.md`;
    const content = fetch(url).then((response) => response.text());

    return content;
  },
};
