import { CacheType, ChatInputCommandInteraction } from 'discord.js';

export default function interactionToURL(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const pathname = [
    interaction.commandName,
    interaction.options.getSubcommandGroup(),
    interaction.options.getSubcommand(),
  ]
    .filter(Boolean)
    .join('/');
  const urlSearchParams = new URLSearchParams();

  interaction.options.data.forEach((option) => {
    if (option.value) urlSearchParams.set(option.name, `${option.value}`);
  });

  console.log(`${urlSearchParams}`);
}
