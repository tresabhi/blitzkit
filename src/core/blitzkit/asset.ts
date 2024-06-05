import { ASSETS_REPO } from '../../constants/assets';
import isDev from './isDev';

export function asset(path: string, dev = isDev()) {
  return `https://raw.githubusercontent.com/tresabhi/${ASSETS_REPO}/${dev ? 'dev' : 'main'}/${path}`;
}
