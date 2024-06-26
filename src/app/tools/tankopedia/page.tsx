'use client';

import PageWrapper from '../../../components/PageWrapper';
import { TankSearch } from './components/TankSearch';

export default function Page() {
  return (
    <PageWrapper color="purple" size={1028}>
      <TankSearch />
    </PageWrapper>
  );
}
