import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { WargamingResponse } from '../types/wargamingResponse.js';
import wargamingError from './wargamingError.js';

export default function getWargamingResponse<Data extends object>(
  url: string,
  interaction: ChatInputCommandInteraction<CacheType>,
  callback: (data: Data) => void,
) {
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
