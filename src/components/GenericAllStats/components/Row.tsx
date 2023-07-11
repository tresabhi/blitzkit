export interface RowProps {
  children: React.ReactNode;
}

export function Row({ children }: RowProps) {
  return <div style={{ display: 'flex', gap: 8 }}>{children}</div>;
}
