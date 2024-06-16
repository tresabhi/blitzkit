'use client';

import { Flex } from '@radix-ui/themes';
import { times } from 'lodash';
import { useRouter } from 'next/navigation';
import { Ad, AdType } from '../../../components/Ad';
import PageWrapper from '../../../components/PageWrapper';
import { useAdExempt } from '../../../hooks/useAdExempt';
import { TankSearch } from './components/TankSearch';

export default function Page() {
  const router = useRouter();
  const exempt = useAdExempt();

  return (
    <PageWrapper size={1200} color="purple">
      <TankSearch
        onSelect={(tank) => {
          router.push(`./tankopedia/${tank.id}`);
        }}
      />

      {!exempt && (
        <Flex justify="center" wrap="wrap">
          {times(2, (index) => (
            <Ad key={index} type={AdType.MediumRectangleHorizontalPurple} />
          ))}
        </Flex>
      )}
    </PageWrapper>
  );
}
