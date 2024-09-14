import { PageWrapper } from '../../../components/PageWrapper';
import { Controls } from './components/Controls';
import { Info } from './components/Info';
import { TankTable } from './components/Table';

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
