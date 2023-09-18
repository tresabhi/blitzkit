import { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div style={{ maxWidth: 780, margin: 'auto', display: 'block' }}>
      {children}
    </div>
  );
}
