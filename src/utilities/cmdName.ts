import isDev from './isDev.js';

export default function cmdName(name: string) {
  return isDev() ? `${name}dev` : name;
}
