import { ASSETS_REPO } from '../../constants/assets';
import { assertSecret } from './secret';

export function asset(path: string) {
  return `https://raw.githubusercontent.com/tresabhi/${ASSETS_REPO}/${assertSecret(
    process.env.NEXT_PUBLIC_ASSET_BRANCH,
  )}/${path}`;
}
