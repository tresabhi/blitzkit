'use client';

import { TimerIcon } from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Popover,
  SegmentedControl,
  Text,
  Theme,
} from '@radix-ui/themes';
import { useState } from 'react';
import { DatePicker } from '../../../../components/DatePicker';
import { Speedometer } from '../../../../components/Speedometer';
import { getAccountInfo } from '../../../../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../../../../core/blitz/getClanAccountInfo';
import { idToRegion } from '../../../../core/blitz/idToRegion';
import { parseBkni } from '../../../../core/blitzkit/parseBkni';
import { PeriodType } from '../../../../core/discord/addPeriodSubCommands';
import {
  BKNI_COLORS,
  BKNI_PERCENTILES,
} from '../../../../core/statistics/getBkniPercentile';
import { useAwait } from '../../../../hooks/useAwait';
import strings from '../../../../lang/en-US.json';

export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const region = idToRegion(id);
  const accountInfo = useAwait(getAccountInfo(region, id));
  const clanAccountInfo = useAwait(getClanAccountInfo(region, id, ['clan']));
  // const bkni = ((Math.round(Date.now() / 1000 / 60) / 100) % 2) - 1;
  const bkni = 0.81;
  const winrate = 0.6;
  const [period, setPeriod] = useState<PeriodType>('30');
  const { bkniColor, bkniMetric, bkniFraction, bkniPercentile } =
    parseBkni(bkni);
  const [customFrom, setCustomFrom] = useState<Date>(
    new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
  );
  const stats = [
    ['Damage', '3,203'],
    ['Tier', '9.83'],
    ['Survival', '70%'],
    ['Kills', '1.54'],
    ['Damage ratio', '2.45'],
    ['Accuracy', '91%'],
  ];
  const [customTo, setCustomTo] = useState<Date>(new Date());
  const [fromSelectorOpen, setFromSelectorOpen] = useState(false);
  const [toSelectorOpen, setToSelectorOpen] = useState(false);

  return (
    <>
      <Theme accentColor={bkniColor}>
        <Flex
          direction="column"
          align="center"
          justify="center"
          py="8"
          gap="6"
          style={{
            background: `linear-gradient(var(--${bkniColor}-a3), var(--${bkniColor}-a1))`,
          }}
        >
          <Flex direction="column" align="center">
            <Heading
              size={{
                initial: '8',
                sm: '9',
              }}
              align="center"
            >
              {accountInfo.nickname}
            </Heading>
            <Text color="gray" align="center">
              {clanAccountInfo?.clan && `[${clanAccountInfo.clan.tag}] • `}
              {
                (clanAccountInfo?.clan
                  ? strings.common.regions.short
                  : strings.common.regions.normal)[region]
              }
            </Text>
          </Flex>

          <Flex direction="column" align="center" gap="3">
            <SegmentedControl.Root
              value={period}
              onValueChange={(value) => setPeriod(value as PeriodType)}
            >
              <SegmentedControl.Item value={'today' satisfies PeriodType}>
                Today
              </SegmentedControl.Item>
              <SegmentedControl.Item value={'30' satisfies PeriodType}>
                30 days
              </SegmentedControl.Item>
              <SegmentedControl.Item value={'career' satisfies PeriodType}>
                Career
              </SegmentedControl.Item>
              <SegmentedControl.Item value={'custom' satisfies PeriodType}>
                Custom
              </SegmentedControl.Item>
            </SegmentedControl.Root>

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
          </Flex>
        </Flex>

        <Flex justify="center" py="8" gap="6">
          <Speedometer
            value={`${bkniMetric}`}
            color={bkniColor}
            fill={bkniFraction}
            label={
              <Popover.Root>
                <Popover.Trigger>
                  <Button
                    style={{ position: 'relative' }}
                    color="gray"
                    size="2"
                    variant="ghost"
                  >
                    <TimerIcon />
                    {strings.common.bkni_percentile[bkniPercentile]}
                  </Button>
                </Popover.Trigger>

                <Popover.Content align="center">
                  <Flex
                    direction="column"
                    style={{
                      width: 'fit-content',
                    }}
                  >
                    <Flex direction="column" mb="3" align="center">
                      <Heading weight="bold" size="5">
                        BkNI
                      </Heading>
                      <Text size="2" color="gray" wrap="wrap">
                        A next generation performance metric
                      </Text>
                    </Flex>

                    {BKNI_PERCENTILES.map(({ percentile, min }, index) => (
                      <Button
                        radius="none"
                        color={BKNI_COLORS[percentile]}
                        key={percentile}
                      >
                        <Flex
                          align="center"
                          justify="between"
                          width="100%"
                          gap="2"
                        >
                          <Text>
                            {strings.common.bkni_percentile[percentile]}
                          </Text>
                          <Text size="1">
                            {min}% - {BKNI_PERCENTILES[index + 1]?.min ?? 100}%
                          </Text>
                        </Flex>
                      </Button>
                    ))}
                  </Flex>
                </Popover.Content>
              </Popover.Root>
            }
          />

          <Speedometer
            value={
              <Flex align="center" gap="1">
                {(winrate * 100).toFixed(0)}
                <Text size="3" color="gray">
                  %
                </Text>
              </Flex>
            }
            color="green"
            fill={0.5 * (Math.cbrt(2 * winrate - 1) + 1)}
            label={<Text color="gray">Winrate</Text>}
          />
        </Flex>

        <Flex style={{ flex: 1 }} wrap="wrap" gap="2" justify="center">
          {stats.map((stat) => (
            <Flex minWidth="96px" direction="column" align="center">
              <Text size="6">{stat[1]}</Text>
              <Text color="gray" size="2">
                {stat[0]}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Theme>

      <Box flexGrow="1" />

      {/* <Flex gap="4">
            <Link href="/tools/tankopedia">
              <Button variant="ghost" size="1" ml="-1">
                <ChevronLeftIcon />
                Back
              </Button>
            </Link>
          </Flex> */}
      {/* <Flex style={{ flex: 1 }} justify="center">
            </Flex>

            */}

      {/* <PageWrapper
        p="6"
        pt="9"
        size={1600}
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

      {isTracking && <Box flexGrow="1" />} */}
    </>
  );
}
