import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout, Flex, Table } from '@radix-ui/themes';
import { use, useMemo } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { TankRowHeaderCell } from '../../../components/TankRowHeaderCell';
import { averageDefinitionsArray } from '../../../core/blitzkit/averageDefinitions';
import { tankDefinitions } from '../../../core/blitzkit/tankDefinitions';

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
    <PageWrapper color="jade">
      <Flex justify="center">
        <Callout.Root style={{ width: 'fit-content' }}>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Based on {samples.toLocaleString()} players with at least 5,000
            career battles and 1 battle in the past 120 days. Updated daily.
            Stats displayed as an average per battle.
          </Callout.Text>
        </Callout.Root>
      </Flex>

      <Table.Root variant="surface" style={{ textWrap: 'nowrap' }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Tank</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0" align="right">
              Winrate
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0" align="right">
              Damage
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0" align="right">
              Survival
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0" align="right">
              XP
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0" align="right">
              Kills
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0" align="right">
              Spots
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0" align="right">
              Accuracy
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0" align="right">
              Shots
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0" align="right">
              Hits
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0" align="right">
              Capture points
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {tankAverages.map((averages) => {
            const tank = awaitedTankDefinitions[averages.id];

            return (
              <Table.Row key={averages.id}>
                <TankRowHeaderCell tank={tank} />
                <Table.Cell align="right">
                  {Math.round(averages.mu.wins * 100)}%
                </Table.Cell>
                <Table.Cell align="right">
                  {Math.round(averages.mu.damage_dealt).toLocaleString()}
                </Table.Cell>
                <Table.Cell align="right">
                  {Math.round(averages.mu.survived_battles * 100)}%
                </Table.Cell>
                <Table.Cell align="right">
                  {Math.round(averages.mu.xp).toLocaleString()}
                </Table.Cell>
                <Table.Cell align="right">
                  {averages.mu.frags.toFixed(2)}
                </Table.Cell>
                <Table.Cell align="right">
                  {averages.mu.spotted.toFixed(2)}
                </Table.Cell>
                <Table.Cell align="right">
                  {Math.round((averages.mu.hits / averages.mu.shots) * 100)}%
                </Table.Cell>
                <Table.Cell align="right">
                  {averages.mu.shots.toFixed(1)}
                </Table.Cell>
                <Table.Cell align="right">
                  {averages.mu.hits.toFixed(1)}
                </Table.Cell>
                <Table.Cell align="right">
                  {averages.mu.capture_points.toFixed(1)}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </PageWrapper>
  );
}
