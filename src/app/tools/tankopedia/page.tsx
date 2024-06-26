'use client';

import { AdMidSectionResponsive } from '../../../components/AdMidSectionResponsive';
import PageWrapper from '../../../components/PageWrapper';
import { useAdExempt } from '../../../hooks/useAdExempt';
import { TankSearch } from './components/TankSearch';

export default function Page() {
  const exempt = useAdExempt();

  return (
    <PageWrapper color="purple" size={1028}>
      <TankSearch />
      {!exempt && <AdMidSectionResponsive />}
    </PageWrapper>
  );
}
