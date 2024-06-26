'use client';

import { AdMidSectionResponsive } from '../../../components/AdMidSectionResponsive';
import PageWrapper from '../../../components/PageWrapper';
import { TankSearch } from './components/TankSearch';

export default function Page() {
  return (
    <PageWrapper color="purple" size={1028}>
      <TankSearch />
      <AdMidSectionResponsive />
    </PageWrapper>
  );
}
