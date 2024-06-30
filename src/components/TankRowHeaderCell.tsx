import { Table, Text } from '@radix-ui/themes';
import { TankDefinition } from '../core/blitzkit/tankDefinitions';
import { tankIcon } from '../core/blitzkit/tankIcon';
import { theme } from '../stitches.config';
import { Link } from './Link';

interface TankRowHeaderCellProps {
  tank: TankDefinition;
}

export function TankRowHeaderCell({ tank }: TankRowHeaderCellProps) {
  return (
    <Table.RowHeaderCell
      style={{
        paddingLeft: 32,
        position: 'relative',
        overflowY: 'hidden',
      }}
    >
      <Link href={`/tools/tankopedia/${tank.id}`}>
        <img
          alt={tank.name}
          draggable={false}
          src={tankIcon(tank.id)}
          style={{
            position: 'absolute',
            width: 128 + 32,
            height: '200%',
            top: '-50%',
            left: 0,
            objectFit: 'contain',
            objectPosition: '50% 50%',
            overflow: 'hidden',
          }}
        />

        <div
          style={{
            backgroundColor: 'red',
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: 128,
            background: 'linear-gradient(90deg, #00000080, #00000000)',
          }}
        />

        <Text
          style={{
            color: theme.colors.textHighContrast,
            position: 'relative',
            textWrap: 'nowrap',
            textShadow: 'black 0 0 4px',
          }}
        >
          {tank.name}
        </Text>
      </Link>
    </Table.RowHeaderCell>
  );
}
