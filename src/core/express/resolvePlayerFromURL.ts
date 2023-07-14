import { RegionDomain } from '../../constants/regions';
import { ResolvedPlayer } from '../discord/resolvePlayerFromCommand';

export default function resolvePlayerFromURL(urlString: string) {
  const url = new URL(urlString);

  return {
    id: parseInt(url.searchParams.get('id')!),
    server: url.searchParams.get('server') as RegionDomain,
  } satisfies ResolvedPlayer;
}
