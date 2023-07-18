import { Region } from '../../constants/regions';
import { ResolvedPlayer } from '../discord/resolvePlayerFromCommand';

export default function resolvePlayerFromURL(urlString: string) {
  const url = new URL(urlString);

  return {
    id: parseInt(url.searchParams.get('id')!),
    region: url.searchParams.get('region') as Region,
  } satisfies ResolvedPlayer;
}
