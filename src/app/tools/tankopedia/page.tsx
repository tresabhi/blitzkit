'use client';

import { Text } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { TankSearch } from './components/TankSearch';

export default function Page() {
  const router = useRouter();

  return (
    <PageWrapper size="wide" color="purple">
      <Suspense fallback={<Text>Loading...</Text>}>
        <TankSearch
          onSelect={(tank) => {
            router.push(`./tankopedia/${tank.id}`);
          }}
        />
      </Suspense>
    </PageWrapper>
  );
}
