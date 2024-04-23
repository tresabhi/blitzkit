import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import { translator } from '../core/localization/translator';
import { COMMANDS_RAW, CommandRegistry } from '../events/interactionCreate';

const subcommands = [
  'embeds',
  'introduction',
  'invite',
  'timezones',
  'creators',
] as const;
type Subcommand = (typeof subcommands)[number];

const DOCS: Record<Subcommand, string> = {
  embeds: 'guide/embeds',
  introduction: 'guide/introduction',
  invite: 'guide/invite',
  timezones: 'guide/timezones',
  creators: 'guide/creators',
};

export const aboutCommand = new Promise<CommandRegistry>(async (resolve) => {
  resolve({
    inProduction: true,
    inPublic: true,

    command: createLocalizedCommand('about', [
      { subcommand: 'commands' },
      ...subcommands.map((subcommand) => ({ subcommand })),
    ]),

    async handler(interaction) {
      const subcommand = interaction.options.getSubcommand();
      const { t } = translator(interaction.locale);

      if (subcommand === 'commands') {
        return t`bot.commands.about.subcommands.commands.body${(
          await Promise.all(COMMANDS_RAW)
        )
          .filter((registry) => registry.inPublic && registry.inProduction)
          .sort((a, b) =>
            (a.command.name_localizations?.[interaction.locale] ??
              a.command.name) <
            (b.command.name_localizations?.[interaction.locale] ??
              b.command.name)
              ? -1
              : 1,
          )
          .map(
            (registry) =>
              `- \`/${
                registry.command.name_localizations?.[interaction.locale] ??
                registry.command.name
              }\`: ${
                registry.command.description_localizations?.[
                  interaction.locale
                ] ?? registry.command.description
              }`,
          )
          .join('\n')}`;
      }

      const url = `https://raw.githubusercontent.com/tresabhi/blitzkit/main/docs/${DOCS[subcommand as Subcommand]}.md`;
      const content = fetch(url).then((response) => response.text());

      return content;
    },
  });
});
