import { Table } from '@radix-ui/themes';
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
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          width: 128,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {tank.testing && (
          <ExperimentIcon style={{ width: '1em', height: '1em' }} />
        )}
        {tank.name}
      </Link>
    </Table.RowHeaderCell>
  );
}
