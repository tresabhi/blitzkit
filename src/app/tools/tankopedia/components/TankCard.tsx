import { Flex, Link, Text } from '@radix-ui/themes';
import { useEffect, useRef } from 'react';
import { classIcons } from '../../../../components/ClassIcon';
import { asset } from '../../../../core/blitzkit/asset';
import { TankDefinition } from '../../../../core/blitzkit/tankDefinitions';
import { tankIcon } from '../../../../core/blitzkit/tankIcon';
import { tankopediaFilterTank } from '../../../../core/blitzkit/tankopediaFilterTank';
import { useTankopediaFilters } from '../../../../stores/tankopediaFilters';

interface TankCardProps {
  tank: TankDefinition;
}

export function TankCard({ tank }: TankCardProps) {
  const Icon = classIcons[tank.class];
  const link = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const unsubscribe = useTankopediaFilters.subscribe((filters) => {
      if (!link.current) return;

      const visible = tankopediaFilterTank(filters, tank);
      link.current.style.display = visible ? 'flex' : 'none';
    });

    return unsubscribe;
  }, []);

  return (
    <Link
      ref={link}
      size="1"
      color={
        tank.treeType === 'collector'
          ? 'blue'
          : tank.treeType === 'premium'
            ? 'amber'
            : 'gray'
      }
      highContrast={tank.treeType === 'researchable'}
      underline="hover"
      href={`/tools/tankopedia/${tank.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
        background: `url(${asset(`flags/scratched/${tank.nation}.webp`)})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top left',
      }}
    >
      <img
        alt={tank.name}
        src={tankIcon(tank.id)}
        height={64}
        style={{
          width: '100%',
          objectPosition: 'center right',
          objectFit: 'contain',
        }}
      />

      <Flex
        justify="center"
        gap="1"
        align="center"
        overflow="hidden"
        width="100%"
        maxWidth="100%"
      >
        <Icon
          style={{
            width: '1em',
            height: '1em',
            minWidth: '1em',
            minHeight: '1em',
          }}
        />
        <Text
          align="center"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {tank.name}
        </Text>
      </Flex>
    </Link>
  );
}
