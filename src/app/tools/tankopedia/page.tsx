import PageWrapper from '../../../components/PageWrapper';
import * as TankFilters from '../../../stores/tankFilters';
import { TankSearch } from './components/TankSearch';

export default function Page() {
  return (
    <TankFilters.Provider>
      <PageWrapper color="purple" size={1028}>
        <TankSearch />
      </PageWrapper>
    </TankFilters.Provider>
  );
}
