import { BlitzServer } from '../../constants/servers';
import { ResolvedPlayer } from '../discord/resolvePlayerFromCommand';

export default function resolvePlayerFromURL(urlString: string) {
  const url = new URL(urlString);

  return {
    id: parseInt(url.searchParams.get('id')!),
    server: url.searchParams.get('server') as BlitzServer,
  } satisfies ResolvedPlayer;
}
