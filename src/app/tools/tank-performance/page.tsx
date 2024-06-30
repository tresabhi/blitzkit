import { Table } from '@radix-ui/themes';
import { use } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { TankRowHeaderCell } from '../../../components/TankRowHeaderCell';
import { averageDefinitionsArray } from '../../../core/blitzkit/averageDefinitions';
import { tankDefinitions } from '../../../core/blitzkit/tankDefinitions';

export default function Page() {
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedAverageDefinitionsArray = use(averageDefinitionsArray);

  return (
    <PageWrapper color="jade">
      <Table.Root variant="surface">
        {awaitedAverageDefinitionsArray.map((averages) => {
          const tank = awaitedTankDefinitions[averages.id];

          return (
            <Table.Row key={averages.id}>
              <TankRowHeaderCell tank={tank} />
              <Table.Cell>{Math.round(averages.mu.wins * 100)}%</Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Root>
    </PageWrapper>
  );
}
