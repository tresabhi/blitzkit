'use client';

import { Flex } from '@radix-ui/themes';
import { Suspense } from 'react';
import { StickyTableRoot } from '../../../../components/StickyTableRoot';
import { BodyLoader } from './BodyLoader';
import { Header } from './Header';
import { Tanks } from './Tanks';

export function TankTable() {
  return (
    <Flex justify="center">
      <StickyTableRoot
        size={{ initial: '1', sm: '2' }}
        variant="surface"
        style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 256px)' }}
      >
        <Header />
        <Suspense fallback={<BodyLoader />}>
          <Tanks />
        </Suspense>
      </StickyTableRoot>
    </Flex>
  );
}
