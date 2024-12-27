import { PageWrapper } from '../../../../components/PageWrapper';
import { PerformanceInfo } from '../../../../components/Performance/PerformanceInfo';
import { PlayerCountControl } from '../../../../components/Performance/PlayerCountControl';
import { TankTable } from '../../../../components/Performance/Table';
import { FilterControl } from '../../../../components/TankSearch/components/FilterControl';
import { TankPerformanceEphemeral } from '../../../../stores/tankPerformanceEphemeral';
import { TankPerformanceSort } from '../../../../stores/tankPerformanceSort';
import type { MaybeSkeletonComponentProps } from '../../../../types/maybeSkeletonComponentProps';

export function Page({ skeleton }: MaybeSkeletonComponentProps) {
  return (
    <TankPerformanceSort.Provider>
      <TankPerformanceEphemeral.Provider>
        <Content skeleton={skeleton} />
      </TankPerformanceEphemeral.Provider>
    </TankPerformanceSort.Provider>
  );
}

function Content({ skeleton }: MaybeSkeletonComponentProps) {
  return (
    <PageWrapper color="jade" maxWidth="100%">
      <PerformanceInfo skeleton={skeleton} />
      <FilterControl />
      <PlayerCountControl />

      <TankTable skeleton={skeleton} />
    </PageWrapper>
  );
}
