import * as TankFilters from '../../../stores/tankFilters';
import * as TankopediaPersistent from '../../../stores/tankopediaPersistent';
import * as TankopediaSort from '../../../stores/tankopediaSort';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TankFilters.Provider>
      <TankopediaPersistent.Provider>
        <TankopediaSort.Provider>{children}</TankopediaSort.Provider>
      </TankopediaPersistent.Provider>
    </TankFilters.Provider>
  );
}
