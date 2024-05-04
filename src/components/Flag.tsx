import { asset } from '../core/blitzkit/asset';

interface FlagProps {
  nation: string;
}

export function Flag({ nation }: FlagProps) {
  return (
    <div
      style={{
        width: 22,
        height: 22,
        overflow: 'hidden',
      }}
    >
      <img alt={nation} src={asset(`flags/circle/${nation}.webp`)} />
    </div>
  );
}
