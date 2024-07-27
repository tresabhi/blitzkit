import * as TankopediaPersistent from '../../../stores/tankopediaPersistent';
import * as TankopediaSort from '../../../stores/tankopediaSort';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TankopediaPersistent.Provider>
        <TankopediaSort.Provider>{children}</TankopediaSort.Provider>
    </TankopediaPersistent.Provider>
  );
}
