'use client';

import { Flex, Heading, Table } from '@radix-ui/themes';
import { random, times } from 'lodash';
import { HeroStat } from '../../../components/AllStatsOverview/components/HeroStat';
import PageWrapper from '../../../components/PageWrapper';
import { Day } from './components/Day';

export default function Page() {
  return (
    <PageWrapper color="iris">
      <Flex gap="2">
        <Heading>TresAbhi</Heading>
        <Heading color="gray">[OPTML]</Heading>
      </Flex>

      <HeroStat color="#8E4EC6" subtitle="Super Unicum" value={3142} />

      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Day</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0" align="right">
              Battles
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="0" align="right">
              Winrate
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {times(random(5, 10), (index) => (
            <Day offset={index} key={index} />
          ))}
        </Table.Body>
      </Table.Root>
    </PageWrapper>
  );
}
