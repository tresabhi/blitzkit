import { asset } from '@blitzkit/core';

interface SmallTankIconProps {
  id: string;
  size?: number;
}

const WIDTH = 70;
const HEIGHT = 24;

export function SmallTankIcon({ id, size = HEIGHT }: SmallTankIconProps) {
  return (
    <div
      style={{
        height: size,
        overflow: 'hidden',
        width: WIDTH * (size / HEIGHT),
      }}
    >
      <img
        alt={`Tank ${id}`}
        src={asset(`api/tanks/${id}/icons/small.png`)}
        style={{
          transform: `scale(${(size / HEIGHT) * 100}%)`,
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}
