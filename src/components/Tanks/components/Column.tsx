import { ReactNode } from 'react';

export interface RootProps {
  children: ReactNode;
}

export function Column({ children }: RootProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        flex: 1,
      }}
    >
      {children}
    </div>
  );
}
