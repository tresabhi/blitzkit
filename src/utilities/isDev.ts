import { argv } from 'process';

const isDevBoolean = argv.includes('--dev');

export default function isDev() {
  return isDevBoolean;
}
