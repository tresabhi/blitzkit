'use client';

import { blackA, slateDark } from '@radix-ui/colors';
import { Card, Inset, Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { tankIcon } from '../../../core/blitzkrieg/tankIcon';
import {
  BlitzkriegTankopediaEntry,
  tanks,
} from '../../../core/blitzkrieg/tankopedia';

const sortedTanks = tanks.then((tanks) =>
  tanks.sort((a, b) => b.tier - a.tier),
);

export default function Page() {
  const [tanks, setTanks] = useState<BlitzkriegTankopediaEntry[]>([]);

  useEffect(() => {
    (async () => setTanks(await sortedTanks))();
  }, []);

  return (
    <PageWrapper
      style={{
        flexWrap: 'wrap',
        flexDirection: 'row',
      }}
    >
      {tanks.map((tank) => (
        <Card
          key={tank.id}
          style={{
            height: 128,
            width: 256,
          }}
        >
          <Inset>
            <a
              href={`/tools/tankopedia/${tank.id}`}
              style={{
                // backgroundColor: 'rgba(255, 0, 0, 0.25)',
                backgroundImage: 'url(https://i.imgur.com/biJPgpm.png)',
                backgroundSize: '151%',
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={tankIcon(tank.id)}
                style={{
                  objectFit: 'contain',
                  objectPosition: 'left center',
                }}
                onLoad={(event) => {
                  // get image width
                  const target = event.target as HTMLImageElement;
                  const { naturalWidth } = target;

                  if (naturalWidth === 256) {
                    target.style.transform = 'translateX(25%)';
                  }
                }}
              />

              <div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  // gradiant with darkest at the bottom
                  background: `linear-gradient(#00000000, ${blackA.blackA5})`,
                }}
              />

              <Text
                size="4"
                color={
                  tank.tree_type === 'collector'
                    ? 'cyan'
                    : tank.tree_type === 'premium'
                    ? 'amber'
                    : undefined
                }
                weight="medium"
                style={{
                  color:
                    tank.tree_type === 'tech-tree'
                      ? slateDark.slate11
                      : undefined,
                  position: 'absolute',
                  bottom: 8,
                  left: 12,
                }}
              >
                {tank.name_short ?? tank.name ?? `Unknown tank ${tank.id}`}
              </Text>
            </a>
          </Inset>
        </Card>
      ))}
    </PageWrapper>
  );
}

{
  /* <Flex direction="column" justify="center" align="end" gap="2">
<Flex justify="end" align="center" gap="1">
  {tank.tree_type !== 'tech-tree' && (
    <Badge
      color={tank.tree_type === 'collector' ? 'blue' : 'amber'}
    >
      {tank.tree_type === 'collector' ? 'Collector' : 'Premium'}
    </Badge>
  )}
  <Badge color="indigo">
    {(() => {
      if (tank.type === 'AT-SPG') return 'Tank Destroyer';
      if (tank.type === 'lightTank') return 'Light Tank';
      if (tank.type === 'mediumTank') return 'Medium Tank';
      if (tank.type === 'heavyTank') return 'Heavy Tank';
    })()}
  </Badge>
</Flex>
</Flex> */
}
