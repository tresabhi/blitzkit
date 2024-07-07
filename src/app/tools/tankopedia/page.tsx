'use client';

import { AdMidSectionResponsive } from '../../../components/AdMidSectionResponsive';
import PageWrapper from '../../../components/PageWrapper';
import { useAdExempt } from '../../../hooks/useAdExempt';
import { TankFiltersProvider } from '../../../stores/tankFilters';
import { TankSearch } from './components/TankSearch';

export default function Page() {
  const exempt = useAdExempt();

  return (
    <TankFiltersProvider>
      <PageWrapper color="purple" size={1028}>
        <TankSearch />
        {!exempt && <AdMidSectionResponsive />}
      </PageWrapper>
    </TankFiltersProvider>
  );
}
