export interface GlowProps {
  color: string;
  direction?: 'default' | 'reverse';
  rotation?: number;
}

const width = 16;

export function Glow({
  color,
  direction = 'default',
  rotation = 0,
}: GlowProps) {
  const color1 = color;
  const color2 = `${color}00`;
  const background = `linear-gradient(${
    direction === 'default' ? 0 : 180
  }deg, ${color1} 0%, ${color2} 100%)`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: direction === 'default' ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <div style={{ height: 54, width, background }} />
      <div style={{ height: 72, width, background }} />
      <div style={{ height: 80, width, background }} />
      <div style={{ height: 72, width, background }} />
      <div style={{ height: 54, width, background }} />
    </div>
  );
}
