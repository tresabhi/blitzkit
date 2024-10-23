interface DeltaCaretProps {
  delta: number;
}

export function DeltaCaret({ delta }: DeltaCaretProps) {
  return (
    <img
      alt={delta > 0 ? 'Increase' : 'Decrease'}
      style={{
        width: 16,
        height: 16,
        objectFit: 'contain',
      }}
      src={
        delta > 0
          ? 'https://i.imgur.com/gjI4a5f.png'
          : 'https://i.imgur.com/lLGZygN.png'
      }
    />
  );
}
