import isDev from './isDev';

export function asset(path: string) {
  return `https://raw.githubusercontent.com/tresabhi/blitzrinth-assets/${isDev() ? 'dev' : 'main'}/${path}`;
}
