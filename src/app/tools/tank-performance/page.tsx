import PageWrapper from '../../../components/PageWrapper';
import * as TankFilters from '../../../stores/tankFilters';
import { FilterControl } from '../tankopedia/components/FilterControl';
import { Info } from './components/Info';
import { TankTable } from './components/Table';
import { TierBreakdown } from './components/TierBreakdown';

export default function Page() {
  return (
    <TankFilters.Provider>
      <PageWrapper color="jade" noMaxWidth>
        <Info />
        <TierBreakdown />
        <FilterControl />
        <TankTable />
      </PageWrapper>
    </TankFilters.Provider>
  );
}
