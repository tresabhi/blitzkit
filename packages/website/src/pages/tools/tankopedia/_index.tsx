import { PageWrapper } from '../../../components/PageWrapper';
import { TankSearch } from '../../../components/TankSearch';
import { App } from '../../../stores/app';
import { TankopediaPersistent } from '../../../stores/tankopediaPersistent';

export function Page() {
  return (
    <PageWrapper color="purple" maxWidth="64rem">
      <TankopediaPersistent.Provider>
        <App.Provider>
          <TankSearch />
        </App.Provider>
      </TankopediaPersistent.Provider>
    </PageWrapper>
  );
}
