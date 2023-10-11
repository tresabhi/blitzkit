import { CacheType, ChatInputCommandInteraction } from 'discord.js';

export interface Parameters {
  [key: string]: string | number | boolean | undefined | null;
}

export default function interactionToURL(
  interaction: ChatInputCommandInteraction<CacheType>,
  parameters?: Parameters,
) {
  const pathname = [
    interaction.commandName,
    interaction.options.getSubcommandGroup(false),
    interaction.options.getSubcommand(false),
  ]
    .filter(Boolean)
    .join('/');
  const params = (parameters ? Object.entries(parameters) : [])
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return `${pathname}${params.length > 0 ? `?${params}` : ''}`;
}
