import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { WargamingResponse } from '../types/wargamingResponse.js';
import wargamingError from './wargamingError.js';

export default async function getWargamingResponse<Data extends object>(
  url: string,
  interaction: ChatInputCommandInteraction<CacheType>,
  callback: (data: Data) => void,
) {
  await interaction.deferReply();

  fetch(url)
    .then((response) => response.json() as Promise<WargamingResponse<Data>>)
    .then((response) => {
      if (response.status === 'ok') {
        callback(response.data);
      } else {
        wargamingError(interaction);
      }
    })
    .catch(() => wargamingError(interaction));
}
