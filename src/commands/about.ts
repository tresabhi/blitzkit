import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { translator } from '../core/localization/translator';
import { COMMANDS_RAW, CommandRegistry } from '../events/interactionCreate';

const RAW_PATH = `https://raw.githubusercontent.com/tresabhi/blitzkrieg/main/docs/`;
const DOCS = {
  embeds: 'guide/embeds',
  introduction: 'guide/introduction',
  invite: 'guide/invite',
  timezones: 'guide/timezones',
  creators: 'guide/creators',
};
const DOC_DESCRIPTIONS: Record<keyof typeof DOCS, string> = {
  embeds: 'How embeds work',
  introduction: 'About the bot',
  invite: 'How to invite the bot',
  timezones: 'How Blitzkrieg infers and uses your timezone',
  creators: 'Who created the bot',
};

function addDocsSubcommands(option: SlashCommandSubcommandsOnlyBuilder) {
  Object.entries(DOC_DESCRIPTIONS).forEach(([key, value]) => {
    option.addSubcommand((sub) => sub.setName(key).setDescription(value));
  });

  return option;
}

export const aboutCommand = new Promise<CommandRegistry>(async (resolve) => {
  resolve({
    inProduction: true,
    inPublic: true,

    command: addDocsSubcommands(
      new SlashCommandBuilder()
        .setName('about')
        .setNameLocalizations({
          // "es-ES":
        })
        .setDescription('All the info you need about the bot')
        .addSubcommand((option) =>
          option
            .setName('commands')
            .setDescription('List of all commands and their descriptions'),
        ),
    ),

    async handler(interaction) {
      const subcommand = interaction.options.getSubcommand();
      const { t } = await translator(interaction.locale);

      if (subcommand === 'commands') {
        return t`bot.commands.about.subcommands.commands.body${(
          await Promise.all(COMMANDS_RAW)
        )
          .filter((registry) => registry.inPublic && registry.inProduction)
          .sort((a, b) => (a.command.name < b.command.name ? -1 : 1))
          .map(
            (registry) =>
              `- \`/${registry.command.name}\`: ${registry.command.description}`,
          )
          .join('\n')}`;
      }

      const url = `${RAW_PATH}${DOCS[subcommand as keyof typeof DOCS]}.md`;
      const content = fetch(url).then((response) => response.text());

      return content;
    },
  });
});
