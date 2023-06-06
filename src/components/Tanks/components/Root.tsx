import { ReactNode } from 'react';

export interface RootProps {
  children: ReactNode;
}

export function Root({ children }: RootProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}
