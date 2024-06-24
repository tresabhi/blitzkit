'use client';

import PageWrapper from '../../../components/PageWrapper';
import { Results } from './components/Results';

export default function Page() {
  return (
    <PageWrapper color="purple" size={1028}>
      <Results />
    </PageWrapper>
  );
}
