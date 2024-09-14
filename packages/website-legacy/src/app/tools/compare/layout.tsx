import { ReactNode } from 'react';
import * as CompareEphemeral from '../../../stores/compareEphemeral';
import * as ComparePersistent from '../../../stores/comparePersistent';
import * as TankFilters from '../../../stores/tankFilters';
import * as TankopediaSort from '../../../stores/tankopediaSort';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <TankopediaSort.Provider>
      <TankFilters.Provider>
        <ComparePersistent.Provider>
          <CompareEphemeral.Provider>{children}</CompareEphemeral.Provider>
        </ComparePersistent.Provider>
      </TankFilters.Provider>
    </TankopediaSort.Provider>
  );
}
