export interface GlowProps {
  color: string;
  direction?: 'default' | 'reverse';
  rotation?: number;
}

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
      <div style={{ height: 54, width: 16, background }} />
      <div style={{ height: 72, width: 16, background }} />
      <div style={{ height: 80, width: 16, background }} />
      <div style={{ height: 72, width: 16, background }} />
      <div style={{ height: 54, width: 16, background }} />
    </div>
  );
}
