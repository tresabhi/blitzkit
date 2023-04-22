import discord from '../../discord.json' assert { type: 'json' };
import isDev from './isDev.js';

export default function getClientId() {
  return isDev() ? discord.client_id_dev : discord.client_id;
}
