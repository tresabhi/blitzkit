import { Flex, Heading } from '@radix-ui/themes';
import { HeroStat } from '../../../components/AllStatsOverview/components/HeroStat';
import PageWrapper from '../../../components/PageWrapper';

export default function Page() {
  return (
    <PageWrapper>
      <Flex gap="2">
        <Heading>TresAbhi</Heading>
        <Heading color="gray">[OPTML]</Heading>
      </Flex>

      <HeroStat color="#00b1ff" subtitle="Super Unicum" value={3112} />
    </PageWrapper>
  );
}
