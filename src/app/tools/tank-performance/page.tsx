import { Flex, Table } from '@radix-ui/themes';
import { Suspense } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { FilterControl } from '../tankopedia/components/FilterControl';
import { BodyLoader } from './components/BodyLoader';
import { Header } from './components/Header';
import { Info } from './components/Info';
import { Tanks } from './components/Tanks';

export default function Page() {
  return (
    <PageWrapper color="jade" noMaxWidth>
      <Info />

      <FilterControl />

      <Flex justify="center">
        <Table.Root variant="surface" style={{ maxWidth: '100%' }}>
          <Header />
          <Suspense fallback={<BodyLoader />}>
            <Tanks />
          </Suspense>
        </Table.Root>
      </Flex>
    </PageWrapper>
  );
}
