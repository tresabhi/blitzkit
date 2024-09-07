import { AutocompleteInteraction, CacheType } from 'discord.js';
import { commands } from '..';

export default async function handleAutocomplete(
  interaction: AutocompleteInteraction<CacheType>,
) {
  const command = (await commands)[interaction.commandName];

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  if (command.autocomplete) command.autocomplete(interaction);
}
