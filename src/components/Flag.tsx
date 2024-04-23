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
      <img src={asset(`flags/circle/${nation}.webp`)} alt={nation} />
    </div>
  );
}
