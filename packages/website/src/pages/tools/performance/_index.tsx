import { PageWrapper } from '../../../components/PageWrapper';
import { Charts } from '../../../components/Performance/Charts';
import { ModeSwitcher } from '../../../components/Performance/ModeSwitcher';
import { PerformanceInfo } from '../../../components/Performance/PerformanceInfo';
import { PlayerCountControl } from '../../../components/Performance/PlayerCountControl';
import { TankTable } from '../../../components/Performance/Table';
import { FilterControl } from '../../../components/TankSearch/components/FilterControl';
import {
  TankPerformanceEphemeral,
  TankPerformanceMode,
} from '../../../stores/tankPerformanceEphemeral';
import { TankPerformanceSort } from '../../../stores/tankPerformanceSort';
import type { MaybeSkeletonComponentProps } from '../../../types/maybeSkeletonComponentProps';

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
  const mode = TankPerformanceEphemeral.use((state) => state.mode);

  return (
    <PageWrapper color="jade" maxWidth="unset">
      <ModeSwitcher />

      <PerformanceInfo skeleton={skeleton} />
      <FilterControl />
      <PlayerCountControl />

      {mode === TankPerformanceMode.Table && <TankTable skeleton={skeleton} />}
      {mode === TankPerformanceMode.Charts && <Charts />}
    </PageWrapper>
  );
}
