import { Flex, Table } from '@radix-ui/themes';
import { TankDefinition } from '../core/blitzkit/tankDefinitions';
import { tankIcon } from '../core/blitzkit/tankIcon';
import { ExperimentIcon } from './ExperimentIcon';
import { Link } from './Link';

interface TankRowHeaderCellProps {
  tank: TankDefinition;
}

export function TankRowHeaderCell({ tank }: TankRowHeaderCellProps) {
  return (
    <Table.RowHeaderCell style={{ display: 'flex' }}>
      <Link href={`/tools/tankopedia/${tank.id}`}>
        <img
          alt={tank.name}
          draggable={false}
          src={tankIcon(tank.id)}
          style={{
            margin: 'calc(-1 * var(--table-cell-padding)) 0',
            height: 'calc(100% + 2 * var(--table-cell-padding))',
            aspectRatio: '16 / 9',
            objectFit: 'cover',
          }}
        />
      </Link>

      <Link
        color="gray"
        highContrast
        underline="hover"
        wrap="nowrap"
        href={`/tools/tankopedia/${tank.id}`}
        style={{
          paddingLeft: 'var(--space-2)',
        }}
      >
        <Flex align="center" gap="1" position="relative" pl="2">
          {tank.testing && (
            <ExperimentIcon style={{ width: '1em', height: '1em' }} />
          )}
          {tank.name}
        </Flex>
      </Link>
    </Table.RowHeaderCell>
  );
}
