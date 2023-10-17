import discord from '../../../discord.json' assert { type: 'json' };
import isDev from './isDev';

export default function getClientId() {
  return isDev() ? discord.client_id_dev : discord.client_id;
}
