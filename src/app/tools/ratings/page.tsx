'use client';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  Button,
  Flex,
  Popover,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes';
import { range } from 'lodash';
import { useState } from 'react';
import useSWR from 'swr';
import * as Leaderboard from '../../../components/Leaderboard';
import PageWrapper from '../../../components/PageWrapper';
import { REGIONS, REGION_NAMES, Region } from '../../../constants/regions';
import getRatingsInfo from '../../../core/blitz/getRatingsInfo';
import getArchivedRatingsInfoAPI from '../../../core/blitzkrieg/getArchivedRatingsInfoAPI';
import { getArchivedRatingsLeaderboardAPI } from '../../../core/blitzkrieg/getArchivedRatingsLeaderboardAPI';
import { numberFetcher } from '../../../core/blitzkrieg/numberFetcher';
import { useRatings } from '../../../stores/ratings';

export const FIRST_ARCHIVED_RATINGS_SEASON = 49;

export default function Page() {
  const ratings = useRatings();
  // null being the latest season
  const [season, setSeason] = useState<null | number>(null);
  const { data: ratingsInfo } = useSWR(
    `ratings-info-${ratings.region}-${season}`,
    () =>
      season === null
        ? getRatingsInfo(ratings.region)
        : getArchivedRatingsInfoAPI(ratings.region, season),
  );
  const [jumpToLeague, setJumpToLeague] = useState(0);
  const { data: latestArchivedSeasonNumber } = useSWR<number>(
    '/api/ratings/latest-archived-season-number',
    numberFetcher,
  );
  const players = useSWR(`ratings-players-${ratings.region}-${season}`, () => {
    if (season === null) {
      // i'll deal with this later
      return null;
    } else {
      return getArchivedRatingsLeaderboardAPI(ratings.region, season);
    }
  });

  return (
    <PageWrapper>
      <Flex gap="2" wrap="wrap">
        <Select.Root
          defaultValue={ratings.region}
          onValueChange={(value) =>
            useRatings.setState({ region: value as Region })
          }
        >
          <Select.Trigger style={{ flex: 1 }} />

          <Select.Content>
            {REGIONS.map((region) => (
              <Select.Item key={region} value={region}>
                {REGION_NAMES[region]}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={`${season}`}
          onValueChange={(value) =>
            setSeason(value === 'null' ? null : parseInt(value))
          }
        >
          <Select.Trigger style={{ flex: 1 }} />

          <Select.Content>
            {ratingsInfo?.detail === undefined && (
              <Select.Item value="null">Current season</Select.Item>
            )}

            <Select.Group>
              <Select.Label>Archives</Select.Label>

              {latestArchivedSeasonNumber &&
                range(
                  FIRST_ARCHIVED_RATINGS_SEASON,
                  latestArchivedSeasonNumber + 1,
                )
                  .map((season) => (
                    <Select.Item key={season} value={`${season}`}>
                      Season {season}
                    </Select.Item>
                  ))
                  .reverse()}
            </Select.Group>
          </Select.Content>
        </Select.Root>

        <Popover.Root>
          <Popover.Trigger>
            <Button variant="soft">Jump to league</Button>
          </Popover.Trigger>

          <Popover.Content>
            <Flex direction="column" gap="2">
              <Select.Root
                value={`${jumpToLeague}`}
                onValueChange={(value) => setJumpToLeague(parseInt(value))}
              >
                <Select.Trigger />

                <Select.Content>
                  {ratingsInfo?.detail === undefined &&
                    ratingsInfo?.leagues.map(({ index, title }) => (
                      <Select.Item key={index} value={`${index}`}>
                        {title}
                      </Select.Item>
                    ))}
                </Select.Content>
              </Select.Root>

              <Flex gap="2">
                <Popover.Close>
                  <Button color="red">Cancel</Button>
                </Popover.Close>

                <Popover.Close>
                  <Button>Jump</Button>
                </Popover.Close>
              </Flex>
            </Flex>
          </Popover.Content>
        </Popover.Root>

        <Popover.Root>
          <Popover.Trigger>
            <Button variant="soft">Jump to player</Button>
          </Popover.Trigger>

          <Popover.Content>
            <Flex gap="2" direction="column">
              <TextField.Root>
                <TextField.Slot>
                  <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>

                <TextField.Input placeholder="Search for player..." />
              </TextField.Root>

              <Flex gap="2">
                <Popover.Close>
                  <Button color="red">Cancel</Button>
                </Popover.Close>

                <Popover.Close>
                  <Button>Jump</Button>
                </Popover.Close>
              </Flex>
            </Flex>
          </Popover.Content>
        </Popover.Root>
      </Flex>

      {players.data && (
        <Leaderboard.Root>
          {players.data.slice(0, 1000).map((player, index) => (
            <Leaderboard.Item
              nickname={`${player.id}`}
              position={index + 1}
              score={player.score}
              key={player.id}
            />
          ))}
        </Leaderboard.Root>
      )}

      {players.isLoading && <Text>Loading...</Text>}
    </PageWrapper>
  );
}
