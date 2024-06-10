'use client';

import { Flex } from '@radix-ui/themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ad, AdType } from '../../../components/Ad';
import PageWrapper from '../../../components/PageWrapper';
import { TankSearch } from './components/TankSearch';

export default function Page() {
  const router = useRouter();

  return (
    <PageWrapper size={1200} color="purple">
      <Flex justify="center">
        <Ad type={AdType.TankopediaHorizontal800} style={{ flex: 1 }} />
      </Flex>

      <TankSearch
        onSelect={(tank) => {
          router.push(`./tankopedia/${tank.id}`);
        }}
      />

      <Flex justify="center" mt="4">
        <Link href="/tools/tankopedia/map">Super duper secret map</Link>
      </Flex>
    </PageWrapper>
  );
}
