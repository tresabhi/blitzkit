import { ASSETS_REPO } from '../../constants/assets';
import isDev from './isDev';

export function asset(path: string) {
  return `https://raw.githubusercontent.com/tresabhi/${ASSETS_REPO}/${isDev() ? 'dev' : 'main'}/${path}`;
}
