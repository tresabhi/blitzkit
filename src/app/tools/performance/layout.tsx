import { ReactNode } from 'react';
import * as TankFilters from '../../../stores/tankFilters';
import * as TankPerformancePersistent from '../../../stores/tankPerformancePersistent';
import * as TankPerformanceSort from '../../../stores/tankPerformanceSort';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <TankPerformancePersistent.Provider>
      <TankPerformanceSort.Provider>
        <TankFilters.Provider>{children}</TankFilters.Provider>
      </TankPerformanceSort.Provider>
    </TankPerformancePersistent.Provider>
  );
}
