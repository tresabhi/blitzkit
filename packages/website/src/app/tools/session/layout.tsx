import { ReactNode } from 'react';
import * as Session from '../../../stores/session';

export default function Layout({ children }: { children: ReactNode }) {
  return <Session.Provider>{children}</Session.Provider>;
}
