'use client';

import { slateDark } from '@radix-ui/colors';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Card, Flex, Inset, Text, TextField } from '@radix-ui/themes';
import { use, useRef } from 'react';
import { Search } from 'react-fuzzysort';
import { tankIcon } from '../../../../../core/blitzkrieg/tankIcon';
import {
  TANK_ICONS,
  TANK_ICONS_COLLECTOR,
  TANK_ICONS_PREMIUM,
  tanks,
} from '../../../../../core/blitzkrieg/tankopedia';
import { theme } from '../../../../../stitches.config';
import * as styles from './index.css';

export function List() {
  const awaitedTanks = use(
    tanks.then((tanks) => tanks.sort((a, b) => b.tier - a.tier)),
  );
  const input = useRef<HTMLInputElement>(null);

  return (
    <>
      <TextField.Root>
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
        <TextField.Input ref={input} placeholder="Search tanks..." />
      </TextField.Root>

      {awaitedTanks.length > 0 && (
        <Flex wrap="wrap" gap="3" justify="center">
          <Search
            keyOptions={{}}
            input={input}
            list={awaitedTanks.map((tank, index) => ({
              node: (
                <a href={`/tools/tankopedia/${tank.id}`}>
                  <Card className={styles.listing}>
                    <Inset
                      key={index}
                      style={{
                        height: 128,
                        width: 256,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        className={styles.listingImage}
                        src={tankIcon(tank.id)}
                        style={{
                          objectFit: 'contain',
                          objectPosition: 'left center',
                        }}
                      />

                      <div
                        className={styles.listingShadow}
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'absolute',
                          transition: `box-shadow ${theme.durations.regular}`,
                        }}
                      />

                      <Flex
                        align="center"
                        justify="center"
                        gap="1"
                        className={styles.listingLabel}
                        style={{
                          position: 'absolute',
                          bottom: 8,
                          left: 12,
                        }}
                      >
                        <img
                          src={
                            (tank.tree_type === 'collector'
                              ? TANK_ICONS_COLLECTOR
                              : tank.tree_type === 'premium'
                              ? TANK_ICONS_PREMIUM
                              : TANK_ICONS)[tank.type]
                          }
                          style={{ width: '1em', height: '1em' }}
                        />
                        <Text
                          size="4"
                          color={
                            tank.tree_type === 'collector'
                              ? 'blue'
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
                          }}
                        >
                          {tank.name_short ??
                            tank.name ??
                            `Unknown tank ${tank.id}`}
                        </Text>
                      </Flex>
                    </Inset>
                  </Card>
                </a>
              ),
              query: `${
                tank.name_short ?? tank.name ?? `Unknown tank ${tank.id}`
              } ${tank.tree_type} ${
                tank.type === 'AT-SPG' ? 'tank destroyer' : tank.type
              } ${tank.id}`,
            }))}
          />
        </Flex>
      )}
    </>
  );
}
