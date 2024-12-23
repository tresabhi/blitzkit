import { Flex } from '@radix-ui/themes';
import { ChartsControl } from '../../../components/Charts/ChartsControl';
import { PlayersInPeriod } from '../../../components/Charts/PlayersInPeriod';
import { PageWrapper } from '../../../components/PageWrapper';
import { FilterControl } from '../../../components/TankSearch/components/FilterControl';
import { Charts } from '../../../stores/charts';

export function Page() {
  return (
    <Charts.Provider>
      <Content />
    </Charts.Provider>
  );
}

function Content() {
  return (
    <PageWrapper maxWidth="unset">
      <FilterControl />
      <ChartsControl />

      <Flex justify="center">
        <Flex direction="column" maxWidth="45rem" flexGrow="1" py="6" gap="9">
          <PlayersInPeriod />
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
