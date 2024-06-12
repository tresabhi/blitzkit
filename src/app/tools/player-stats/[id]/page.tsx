'use client';

import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import {
  Box,
  Callout,
  Flex,
  Heading,
  Link,
  Popover,
  Tabs,
  Text,
} from '@radix-ui/themes';
import { useState } from 'react';
import { BkniIndicator } from '../../../../components/BkniIndicator';
import { DatePicker } from '../../../../components/DatePicker';
import PageWrapper from '../../../../components/PageWrapper';
import { getAccountInfo } from '../../../../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../../../../core/blitz/getClanAccountInfo';
import { idToRegion } from '../../../../core/blitz/idToRegion';
import { parseBkni } from '../../../../core/blitzkit/parseBkni';
import { useAwait } from '../../../../hooks/useAwait';
import strings from '../../../../lang/en-US.json';
import { FlippedTrigger } from './components/FlippedTrigger';
import * as styles from './page.css';

export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const region = idToRegion(id);
  const accountInfo = useAwait(getAccountInfo(region, id));
  const clanAccountInfo = useAwait(getClanAccountInfo(region, id, ['clan']));
  // const bkni = ((Math.round(Date.now() / 1000 / 60) / 100) % 2) - 1;
  const bkni = 2 * Math.random() - 1;
  const [period, setPeriod] = useState<'custom' | number>(30);
  const { bkniColor } = parseBkni(bkni);
  const isTracking = false;
  const [customFrom, setCustomFrom] = useState<Date>(
    new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
  );
  const stats = [
    ['Winrate', '70%'],
    ['Damage', '3,203'],
    ['Damage ratio', '2.45'],
    ['Tier', '9.83'],
    ['Survival', '70%'],
    ['Accuracy', '91%'],
    ['Kills', '1.54'],
  ];
  const [customTo, setCustomTo] = useState<Date>(new Date());
  const [fromSelectorOpen, setFromSelectorOpen] = useState(false);
  const [toSelectorOpen, setToSelectorOpen] = useState(false);

  return (
    <>
      <PageWrapper
        p={{
          initial: '6',
          md: '8',
        }}
        pt={{
          initial: '9',
          md: '8',
        }}
        size={1024}
        noFlex1
        position="relative"
        color={bkniColor}
        containerProps={{
          style: {
            background: `linear-gradient(var(--${bkniColor}-a2), var(--${bkniColor}-a1))`,
          },
        }}
      >
        <Tabs.Root
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'scaleY(-1) translateX(-50%)',
          }}
          value={`${period}`}
          onValueChange={(value) => {
            setPeriod(value === 'custom' ? 'custom' : Number(value));
          }}
        >
          <Tabs.List justify="center">
            <FlippedTrigger value="1">Today</FlippedTrigger>
            <FlippedTrigger value="30">30 days</FlippedTrigger>
            <FlippedTrigger value="Infinity">Career</FlippedTrigger>
            <FlippedTrigger value="custom">Custom</FlippedTrigger>
          </Tabs.List>
        </Tabs.Root>

        <Flex
          justify="between"
          align="center"
          direction={{
            initial: 'column',
            md: 'row',
          }}
          gap="4"
        >
          <Flex
            direction="column"
            align={{
              initial: 'center',
              md: 'start',
            }}
          >
            <Heading size="8">{accountInfo.nickname}</Heading>

            <Text color="gray">
              {clanAccountInfo?.clan && `[${clanAccountInfo.clan.tag}] • `}
              {
                (clanAccountInfo?.clan
                  ? strings.common.regions.short
                  : strings.common.regions.normal)[region]
              }
            </Text>
          </Flex>

          <BkniIndicator bkni={bkni} className={styles.bkniIndicator} />
        </Flex>
      </PageWrapper>

      <PageWrapper color={bkniColor} noFlex1 align="center">
        {period === 'custom' && (
          <Text>
            From{' '}
            <Popover.Root
              open={fromSelectorOpen}
              onOpenChange={setFromSelectorOpen}
            >
              <Popover.Trigger>
                <Link underline="always" href="#">
                  {customFrom.toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Link>
              </Popover.Trigger>

              <Popover.Content>
                <DatePicker
                  defaultDate={customFrom}
                  onDateChange={(date) => {
                    setCustomFrom(date);
                    setFromSelectorOpen(false);
                  }}
                />
              </Popover.Content>
            </Popover.Root>{' '}
            to{' '}
            <Popover.Root
              open={toSelectorOpen}
              onOpenChange={setToSelectorOpen}
            >
              <Popover.Trigger>
                <Link underline="always" href="#">
                  {customTo.toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Link>
              </Popover.Trigger>

              <Popover.Content>
                <DatePicker
                  defaultDate={customTo}
                  onDateChange={(date) => {
                    setCustomTo(date);
                    setToSelectorOpen(false);
                  }}
                />
              </Popover.Content>
            </Popover.Root>
          </Text>
        )}

        <Flex direction="column" align="center">
          <Heading size="9">72%</Heading>
          <Text color="gray">Winrate</Text>
        </Flex>

        <Flex wrap="wrap" gap="2" justify="center" maxWidth="416px">
          {stats.map((stat) => (
            <Flex minWidth="96px" direction="column" align="center">
              <Text size="7">{stat[1]}</Text>
              <Text color="gray" size="2">
                {stat[0]}
              </Text>
            </Flex>
          ))}
        </Flex>
      </PageWrapper>

      <Flex flexGrow="1" justify="center" align="center" p="4">
        <Callout.Root color="red" mt="4">
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text>
            We haven't tracked long enough to provide statistics. Please check
            back after a few days.
          </Callout.Text>
        </Callout.Root>
      </Flex>

      {isTracking && <Box flexGrow="1" />}
    </>
  );
}
