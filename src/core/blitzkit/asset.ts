import { ASSETS_REPO } from '../../constants/assets';
import { assertSecrete } from './secrete';

export function asset(path: string) {
  return `https://raw.githubusercontent.com/tresabhi/${ASSETS_REPO}/${assertSecrete(
    process.env.NEXT_PUBLIC_ASSET_BRANCH,
  )}/${path}`;
}
