'use client';

import { useRouter } from 'next/navigation';
import PageWrapper from '../../../components/PageWrapper';
import { TankSearch } from './components/TankSearch';

export default function Page() {
  const router = useRouter();

  return (
    <PageWrapper size="double" color="purple">
      <TankSearch
        onSelect={(tank) => {
          router.push(`./tankopedia/${tank.id}`);
        }}
      />
    </PageWrapper>
  );
}
