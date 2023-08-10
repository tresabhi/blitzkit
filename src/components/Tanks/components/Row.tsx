import { ReactNode } from 'react';

export interface RowProps {
  children: ReactNode;
}

export function Row({ children }: RowProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
      }}
    >
      {children}
    </div>
  );
}
