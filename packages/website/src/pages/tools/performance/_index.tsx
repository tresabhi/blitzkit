import { PageWrapper } from '../../../components/PageWrapper';
import { Controls } from '../../../components/Performance/Controls';
import { PerformanceInfo } from '../../../components/Performance/PerformanceInfo';
import { TankTable } from '../../../components/Performance/Table';
import { TankPerformancePersistent } from '../../../stores/tankPerformancePersistent';
import { TankPerformanceSort } from '../../../stores/tankPerformanceSort';
import type { MaybeSkeletonComponentProps } from '../../../types/maybeSkeletonComponentProps';

export function Page({ skeleton }: MaybeSkeletonComponentProps) {
  return (
    <TankPerformanceSort.Provider>
      <TankPerformancePersistent.Provider>
        <Content skeleton={skeleton} />
      </TankPerformancePersistent.Provider>
    </TankPerformanceSort.Provider>
  );
}

function Content({ skeleton }: MaybeSkeletonComponentProps) {
  return (
    <PageWrapper color="jade" noMaxWidth>
      <PerformanceInfo skeleton={skeleton} />
      <Controls />
      <TankTable skeleton={skeleton} />
    </PageWrapper>
  );
}
