import { Client, Routes } from 'discord.js';
import { exit } from 'process';
import discord from '../../discord.json' assert { type: 'json' };
import getClientId from '../utilities/getClientId.js';
import { rest } from './interactionCreate.js';

export const EXIT_EVENT_NAMES = [
  'exit',
  'SIGINT',
  'SIGUSR1',
  'SIGUSR2',
  'uncaughtException',
];

export default function cleanup(client: Client) {
  console.log('Cleaning up...');

  console.log('Unregistering public commands...');
  rest.put(Routes.applicationCommands(getClientId()), { body: [] });

  console.log('Unregistering guild commands...');
  rest.put(Routes.applicationGuildCommands(getClientId(), discord.guild_id), {
    body: [],
  });

  console.log('Destroying client...');
  try {
    client.destroy();
  } catch (e) {
    console.error('Failed to destroy client');
    console.error(e);
  }

  console.log('Removing all exit event listeners...');
  EXIT_EVENT_NAMES.forEach((exitEventName) =>
    process.off(exitEventName, () => cleanup(client)),
  );

  console.log('Exiting...');
  exit();
}
