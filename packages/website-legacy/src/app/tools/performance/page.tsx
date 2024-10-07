import { Controls } from '../../../../../website/src/components/Performance/Controls';
import { Info } from '../../../../../website/src/components/Performance/PerformanceInfo';
import { TankTable } from '../../../../../website/src/components/Performance/Table';
import { PageWrapper } from '../../../components/PageWrapper';

export default function Page() {
  return (
    <PageWrapper color="jade" noMaxWidth>
      <Info />
      {/* <TierBreakdown /> */}
      <Controls />
      <TankTable />
    </PageWrapper>
  );
}
