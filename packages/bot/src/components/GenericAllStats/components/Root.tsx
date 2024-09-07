interface RootProps {
  children: React.ReactNode;
}

export function Root({ children }: RootProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {children}
    </div>
  );
}
