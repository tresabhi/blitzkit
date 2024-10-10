import { PageWrapper } from '../../../components/PageWrapper';
import { TankSearch } from '../../../components/TankSearch';
import { App } from '../../../stores/app';

export function Page() {
  return (
    <PageWrapper color="purple" size={1028}>
      <App.Provider>
        <TankSearch />
      </App.Provider>
    </PageWrapper>
  );
}
