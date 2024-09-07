import { assertSecret } from '@blitzkit/core/src/blitzkit/assertSecret';
import { ASSETS_REPO } from '../../constants/assets';

export function asset(path: string) {
  return `https://raw.githubusercontent.com/tresabhi/${ASSETS_REPO}/${assertSecret(
    process.env.NEXT_PUBLIC_ASSET_BRANCH,
  )}/${path}`;
}
