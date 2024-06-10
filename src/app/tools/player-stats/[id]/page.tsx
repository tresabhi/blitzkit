'use client';

import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import {
  Box,
  Callout,
  Flex,
  Heading,
  Popover,
  Tabs,
  Text,
} from '@radix-ui/themes';
import { use, useMemo, useState } from 'react';
import { BkniIndicator } from '../../../../components/BkniIndicator';
import { DatePicker } from '../../../../components/DatePicker';
import { DummyLink } from '../../../../components/DummyLink';
import PageWrapper from '../../../../components/PageWrapper';
import { getAccountInfo } from '../../../../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../../../../core/blitz/getClanAccountInfo';
import { idToRegion } from '../../../../core/blitz/idToRegion';
import { parseBkni } from '../../../../core/blitzkit/parseBkni';
import strings from '../../../../lang/en-US.json';
import { FlippedTrigger } from './components/FlippedTrigger';

export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const region = idToRegion(id);
  const accountInfoPromise = useMemo(() => getAccountInfo(region, id), [id]);
  const accountInfo = use(accountInfoPromise);
  const clanAccountInfoPromise = useMemo(
    () => getClanAccountInfo(region, id, ['clan']),
    [id],
  );
  const clanAccountInfo = use(clanAccountInfoPromise);
  const bkni = ((Math.round(Date.now() / 1000 / 60) / 100) % 2) - 1;
  const [period, setPeriod] = useState<'custom' | number>(30);
  const { bkniColor } = parseBkni(bkni);
  const isTracking = false;

  return (
    <>
      <PageWrapper
        p={{
          initial: '6',
          md: '8',
        }}
        size={1024}
        noFlex1
        color={bkniColor}
        containerProps={{
          style: {
            background: `linear-gradient(var(--${bkniColor}-a2), var(--${bkniColor}-a1))`,
          },
        }}
      >
        <Flex
          justify="between"
          align="center"
          direction={{
            initial: 'column-reverse',
            md: 'row',
          }}
          gap={{
            initial: '8',
            md: '4',
          }}
        >
          <Flex
            direction="column"
            align={{
              initial: 'center',
              md: 'start',
            }}
          >
            <Heading
              size={{
                initial: '7',
                xs: '8',
              }}
            >
              {accountInfo.nickname}
            </Heading>

            <Text color="gray">
              {clanAccountInfo?.clan && `[${clanAccountInfo.clan.tag}] • `}
              {strings.common.regions.short[region]}
            </Text>
          </Flex>

          <BkniIndicator bkni={bkni} />
        </Flex>
      </PageWrapper>

      <PageWrapper color={bkniColor} noFlex1 pt="0" align="center">
        <Tabs.Root
          style={{
            transform: 'scaleY(-1)',
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

        {period === 'custom' && (
          <Text>
            From{' '}
            <Popover.Root>
              <Popover.Trigger>
                <DummyLink underline="always">June 1, 2021</DummyLink>
              </Popover.Trigger>

              <Popover.Content>
                <DatePicker />
              </Popover.Content>
            </Popover.Root>{' '}
            to <DummyLink underline="always">June 7, 2024</DummyLink>
          </Text>
        )}
      </PageWrapper>

      {!isTracking && (
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
      )}

      {isTracking && <Box flexGrow="1" />}
    </>
  );
}
