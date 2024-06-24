'use client';

import { Flex } from '@radix-ui/themes';
import PageWrapper from '../../../components/PageWrapper';
import { Results } from './components/Results';

export default function Page() {
  return (
    <PageWrapper color="purple" size={1028}>
      <Flex
        gap="8"
        direction={{ initial: 'column', sm: 'row' }}
        py="4"
        flexGrow="1"
      >
        {/* <FilterControl /> */}
        <Results />
      </Flex>
    </PageWrapper>
  );
}
