import { type TankDefinition, tankIcon, TankType } from '@blitzkit/core';
import { useLocale } from '../hooks/useLocale';
import { classIcons } from './ClassIcon';
import { ExperimentIcon } from './ExperimentIcon';
import { LinkI18n } from './LinkI18n';
import { StickyRowHeaderCell } from './StickyRowHeaderCell';

interface TankRowHeaderCellProps {
  tank: TankDefinition;
}

export function TankRowHeaderCell({ tank }: TankRowHeaderCellProps) {
  const { locale } = useLocale();
  const Icon = classIcons[tank.class];

  return (
    <StickyRowHeaderCell
      width={{ initial: '144px', sm: '240px' }}
      style={{ overflow: 'hidden' }}
    >
      <LinkI18n
        locale={locale}
        href={`/tools/tankopedia/${tank.id}`}
        tabIndex={-1}
      >
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
      </LinkI18n>

      <LinkI18n
        locale={locale}
        color={
          tank.type === TankType.COLLECTOR
            ? 'blue'
            : tank.type === TankType.PREMIUM
              ? 'amber'
              : 'gray'
        }
        highContrast={tank.type === TankType.RESEARCHABLE}
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
      </LinkI18n>
    </StickyRowHeaderCell>
  );
}
