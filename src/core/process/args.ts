import { argv } from 'process';
import errorWithCause from './errorWithCause.js';

type ArgumentName = 'discord-token' | 'wargaming-application-id';

const args: Record<ArgumentName, string> = {
  'discord-token': '',
  'wargaming-application-id': '',
};

argv.forEach((arg) => {
  if (arg.includes('=')) {
    const [name, value] = arg.split('=');
    args[name as ArgumentName] = value;
  }
});

Object.keys(args).forEach((arg) => {
  if (args[arg as ArgumentName] === '') {
    throw errorWithCause(
      `Missing argument: ${arg}`,
      'Missing required auth key.',
    );
  }
});

export const discordToken = args['discord-token'];
export const wargamingApplicationId = args['wargaming-application-id'];
