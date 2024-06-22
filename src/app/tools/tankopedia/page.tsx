'use client';

import { Flex } from '@radix-ui/themes';
import PageWrapper from '../../../components/PageWrapper';
import { FilterControl } from './components/FilterControl';
import { Results } from './components/Results';

export default function Page() {
  return (
    <PageWrapper color="purple" size={1028 + 256}>
      <Flex
        gap="8"
        direction={{ initial: 'column', sm: 'row' }}
        pt={{ initial: '0', sm: '6' }}
        pb="6"
      >
        <FilterControl />
        <Results />
      </Flex>
    </PageWrapper>
  );
}
