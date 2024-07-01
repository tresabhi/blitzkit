import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout, Flex, Table } from '@radix-ui/themes';
import { use, useMemo } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { averageDefinitionsArray } from '../../../core/blitzkit/averageDefinitions';
import { tankDefinitions } from '../../../core/blitzkit/tankDefinitions';
import { TankRow } from './components/TankRow';

export default function Page() {
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedAverageDefinitionsArray = use(averageDefinitionsArray);
  const tankAverages = useMemo(
    () => awaitedAverageDefinitionsArray.sort((a, b) => b.mu.wins - a.mu.wins),
    [],
  );
  const samples = useMemo(
    () => awaitedAverageDefinitionsArray.reduce((a, b) => a + b.samples, 0),
    [],
  );

  return (
    <PageWrapper color="jade" noMaxWidth>
      <Flex justify="center">
        <Callout.Root style={{ width: 'fit-content' }}>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Based on {samples.toLocaleString()} players with at least 5,000
            career battles and 1 battle in the past 120 days. Stats displayed as
            an average per battle. Updated daily.
          </Callout.Text>
        </Callout.Root>
      </Flex>

      <Flex justify="center">
        <Table.Root variant="surface" style={{ maxWidth: '100%' }}>
          <Table.Header>
            <Table.Row align="end">
              <Table.ColumnHeaderCell>Tank</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0" justify="center">
                Winrate
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0" justify="center">
                Players
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0" justify="center">
                Damage
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0" justify="center">
                Survival
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0" justify="center">
                XP
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0" justify="center">
                Kills
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0" justify="center">
                Spots
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0" justify="center">
                Accuracy
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0" justify="center">
                Shots
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0" justify="center">
                Hits
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0" justify="center">
                Damage ratio
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0" justify="center">
                Damage received
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0" justify="center">
                Capture points
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="0" justify="center">
                Dropped capture points
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {tankAverages.map((averages) => {
              const tank = awaitedTankDefinitions[averages.id];
              return <TankRow tank={tank} key={tank.id} />;
            })}
          </Table.Body>
        </Table.Root>
      </Flex>
    </PageWrapper>
  );
}
