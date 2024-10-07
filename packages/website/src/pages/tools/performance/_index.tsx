import { PageWrapper } from '../../../components/PageWrapper';
import { Controls } from '../../../components/Performance/Controls';
import { PerformanceInfo } from '../../../components/Performance/PerformanceInfo';
import { TankTable } from '../../../components/Performance/Table';
import { TankPerformancePersistent } from '../../../stores/tankPerformancePersistent';
import { TankPerformanceSort } from '../../../stores/tankPerformanceSort';

export function Page() {
  return (
    <TankPerformanceSort.Provider>
      <TankPerformancePersistent.Provider>
        <Content />
      </TankPerformancePersistent.Provider>
    </TankPerformanceSort.Provider>
  );
}

function Content() {
  return (
    <PageWrapper color="jade" noMaxWidth>
      <PerformanceInfo />
      <Controls />
      <TankTable />
    </PageWrapper>
  );
}
