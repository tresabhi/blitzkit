import PageWrapper from '../../../components/PageWrapper';
import { FilterControl } from '../tankopedia/components/FilterControl';
import { Info } from './components/Info';
import { TankTable } from './components/Table';

export default function Page() {
  return (
    <PageWrapper color="jade" noMaxWidth>
      <Info />
      {/* <TierBreakdown /> */}
      <FilterControl />
      <TankTable />
    </PageWrapper>
  );
}
