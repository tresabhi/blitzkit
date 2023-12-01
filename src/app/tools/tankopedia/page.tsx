import { Text } from '@radix-ui/themes';
import { Suspense } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { List } from './components/List';

export default function Page() {
  return (
    <PageWrapper size="wide">
      <Suspense fallback={<Text>Loading...</Text>}>
        <List />
      </Suspense>
    </PageWrapper>
  );
}
