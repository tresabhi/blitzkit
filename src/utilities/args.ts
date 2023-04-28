import { argv } from 'process';

type ArgumentName = 'discord-token' | 'wargaming-application-id';

export const args: Record<ArgumentName, string> = {
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
    throw new Error(`Missing argument: ${arg}`);
  }
});
