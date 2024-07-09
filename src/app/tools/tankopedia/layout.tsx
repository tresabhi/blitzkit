import * as TankopediaSort from '../../../stores/tankopediaSort';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TankopediaSort.Provider>{children}</TankopediaSort.Provider>;
}
