import { PageWrapper } from '../../../components/PageWrapper';
import { TierListTable } from '../../../components/TierList/Table';
import { TierListTiles } from '../../../components/TierList/Tiles';
import { TankopediaPersistent } from '../../../stores/tankopediaPersistent';
import { TierList } from '../../../stores/tierList';

export function Page() {
  return (
    <TierList.Provider>
      <TankopediaPersistent.Provider>
        <Content />
      </TankopediaPersistent.Provider>
    </TierList.Provider>
  );
}

function Content() {
  return (
    <PageWrapper color="orange">
      <TierListTable />
      <TierListTiles />
    </PageWrapper>
  );
}
