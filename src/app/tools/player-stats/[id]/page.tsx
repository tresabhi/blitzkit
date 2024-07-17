'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Popover,
  SegmentedControl,
  Table,
  Text,
  Theme,
} from '@radix-ui/themes';
import { use, useMemo, useState } from 'react';
import { DatePicker } from '../../../../components/DatePicker';
import { PERCENTILE_COLORS } from '../../../../components/PercentileIndicator/constants';
import { getAccountInfo } from '../../../../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../../../../core/blitz/getClanAccountInfo';
import getTankStats from '../../../../core/blitz/getTankStats';
import { idToRegion } from '../../../../core/blitz/idToRegion';
import { averageDefinitions } from '../../../../core/blitzkit/averageDefinitions';
import { tankDefinitions } from '../../../../core/blitzkit/tankDefinitions';
import { PeriodType } from '../../../../core/discord/addPeriodSubCommands';
import calculateWN8 from '../../../../core/statistics/calculateWN8';
import { calculateWSS } from '../../../../core/statistics/calculateWSS';
import getWN8Percentile from '../../../../core/statistics/getWN8Percentile';
import getWssInterpretation, {
  WSS_COLORS,
  WSS_INTERPRETATIONS,
} from '../../../../core/statistics/getWssPercentile';
import { useAwait } from '../../../../hooks/useAwait';
import strings from '../../../../lang/en-US.json';

export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const region = idToRegion(id);
  const accountInfo = useAwait(getAccountInfo(region, id));
  const clanAccountInfo = useAwait(getClanAccountInfo(region, id, ['clan']));
  const [period, setPeriod] = useState<PeriodType>('30');
  const [customFrom, setCustomFrom] = useState<Date>(
    new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
  );
  const [customTo, setCustomTo] = useState<Date>(new Date());
  const [fromSelectorOpen, setFromSelectorOpen] = useState(false);
  const [toSelectorOpen, setToSelectorOpen] = useState(false);
  const tanksStatsPromise = useMemo(
    () => getTankStats(region, id),
    [region, id],
  );
  const tankStats = use(tanksStatsPromise);
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedAverageDefinitions = use(averageDefinitions);

  const theme = 'purple';

  return (
    <>
      <Theme accentColor={theme}>
        <Flex
          direction="column"
          align="center"
          justify="center"
          py="8"
          gap="6"
          style={{
            background: `linear-gradient(var(--${theme}-a3), var(--${theme}-a1))`,
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

        <Flex justify="center" py="9">
          <Flex direction="column" width="fit-content">
            {WSS_INTERPRETATIONS.map(
              ({ interpretation, minPercentile }, index) => {
                const color = WSS_COLORS[interpretation];
                const name = strings.common.wss_interprGetations[interpretation];
                const nextInterpretation = WSS_INTERPRETATIONS[index + 1];

                return (
                  <Button radius="none" color={color}>
                    {name} ({minPercentile * 100}% to{' '}
                    {(nextInterpretation
                      ? nextInterpretation.minPercentile
                      : 1) * 100}
                    %)
                  </Button>
                );
              },
            )}
          </Flex>
        </Flex>

        <Flex justify="center">
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.RowHeaderCell>Tank</Table.RowHeaderCell>
                <Table.RowHeaderCell>WN8</Table.RowHeaderCell>
                <Table.RowHeaderCell>WSS</Table.RowHeaderCell>
                <Table.RowHeaderCell>Winrate</Table.RowHeaderCell>
                <Table.RowHeaderCell>Games</Table.RowHeaderCell>
                <Table.RowHeaderCell>Damage</Table.RowHeaderCell>
                <Table.RowHeaderCell>XP</Table.RowHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {tankStats
                ?.filter(
                  (stats) =>
                    awaitedTankDefinitions[stats.tank_id] &&
                    awaitedAverageDefinitions.averages[stats.tank_id] &&
                    stats.all.battles > 0,
                )
                .sort(
                  (a, b) =>
                    awaitedTankDefinitions[b.tank_id].tier -
                    awaitedTankDefinitions[a.tank_id].tier,
                )
                .map((stats) => {
                  const tank = awaitedTankDefinitions[stats.tank_id];
                  const averages =
                    awaitedAverageDefinitions.averages[stats.tank_id];
                  const wn8 = calculateWN8(averages.mu, stats.all);
                  const wss = calculateWSS(
                    averages.sigma,
                    averages.mu,
                    averages.r,
                    { ...stats.all, battle_life_time: stats.battle_life_time },
                  );
                  const wn8Percentile = getWN8Percentile(wn8);
                  const wn8Color = PERCENTILE_COLORS[wn8Percentile];
                  const wssInterpretation = getWssInterpretation(wss);
                  const wssColor = WSS_COLORS[wssInterpretation];

                  return (
                    <Table.Row>
                      <Table.Cell>
                        ({tank.tier}) {tank.name}
                      </Table.Cell>
                      <Table.Cell>
                        <Flex>
                          <Box
                            width="1em"
                            height="1em"
                            display="inline-block"
                            style={{ backgroundColor: wn8Color }}
                          />
                          {Math.round(wn8).toLocaleString()}{' '}
                          {strings.common.wn8_percentile[wn8Percentile]}
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex>
                          <Box
                            width="1em"
                            height="1em"
                            display="inline-block"
                            style={{
                              backgroundColor: `var(--${wssColor}-9)`,
                            }}
                          />
                          {Math.round(wss * 1000).toLocaleString()}{' '}
                          {
                            strings.common.wss_interpretations[
                              wssInterpretation
                            ]
                          }
                        </Flex>
                      </Table.Cell>

                      <Table.Cell>
                        {(100 * (stats.all.wins / stats.all.battles)).toFixed(
                          1,
                        )}
                        %
                      </Table.Cell>
                      <Table.Cell>{stats.all.battles}</Table.Cell>
                      <Table.Cell>
                        {Math.round(
                          stats.all.damage_dealt / stats.all.battles,
                        ).toLocaleString()}
                      </Table.Cell>
                      <Table.Cell>
                        {Math.round(
                          stats.all.xp / stats.all.battles,
                        ).toLocaleString()}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
            </Table.Body>
          </Table.Root>
        </Flex>
      </Theme>

      <Box flexGrow="1" />
    </>
  );
}
