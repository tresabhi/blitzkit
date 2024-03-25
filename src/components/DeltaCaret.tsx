interface DeltaCaretProps {
  delta: number;
}

export function DeltaCaret({ delta }: DeltaCaretProps) {
  return (
    <img
      width={16}
      height={16}
      src={
        delta > 0
          ? 'https://i.imgur.com/gjI4a5f.png'
          : 'https://i.imgur.com/lLGZygN.png'
      }
    />
  );
}
