import { TankDefinition } from '@blitzkit/core';
import { tankIcon } from '@blitzkit/core/src/blitzkit/tankIcon';
import { classIcons } from './ClassIcon';
import { ExperimentIcon } from './ExperimentIcon';
import { Link } from './Link';
import { StickyRowHeaderCell } from './StickyRowHeaderCell';

interface TankRowHeaderCellProps {
  tank: TankDefinition;
}

export function TankRowHeaderCell({ tank }: TankRowHeaderCellProps) {
  const Icon = classIcons[tank.class];

  return (
    <StickyRowHeaderCell
      width={{ initial: '144px', sm: '240px' }}
      style={{ overflow: 'hidden' }}
    >
      <Link href={`/tools/tankopedia/${tank.id}`} tabIndex={-1}>
        <img
          alt={tank.name}
          draggable={false}
          src={tankIcon(tank.id)}
          style={{
            margin: 'calc(-1 * var(--table-cell-padding)) 0',
            height: 'calc(100% + 2 * var(--table-cell-padding))',
            aspectRatio: '4 / 3',
            objectFit: 'cover',
          }}
        />
      </Link>

      <Link
        color={
          tank.treeType === 'collector'
            ? 'blue'
            : tank.treeType === 'premium'
            ? 'amber'
            : 'gray'
        }
        highContrast={tank.treeType === 'researchable'}
        underline="hover"
        wrap="nowrap"
        href={`/tools/tankopedia/${tank.id}`}
        style={{
          paddingLeft: 'var(--space-2)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        size={{ initial: '1', sm: '2' }}
      >
        <Icon
          width="1em"
          height="1em"
          style={{ minWidth: '1em', minHeight: '1em' }}
        />

        {tank.testing && (
          <ExperimentIcon style={{ width: '1em', height: '1em' }} />
        )}

        {tank.name}
      </Link>
    </StickyRowHeaderCell>
  );
}
