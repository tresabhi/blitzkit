import { ReactNode } from 'react';

export interface RootProps {
  children: ReactNode;
}

export function Root({ children }: RootProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {children}
    </div>
  );
}
