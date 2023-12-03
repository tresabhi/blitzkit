import { ReactNode } from 'react';

export interface RootProps {
  children: ReactNode;
}

export function Root({ children }: RootProps) {
  return (
    <div
      className="session-tracker-root"
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      {children}
    </div>
  );
}
