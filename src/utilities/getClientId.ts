import { argv } from 'process';
import discord from '../../discord.json' assert { type: 'json' };

const isDev = argv.includes('--dev');

export default function getClientId() {
  return isDev ? discord.client_id_dev : discord.client_id;
}
