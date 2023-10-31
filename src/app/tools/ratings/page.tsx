'use client';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Button, Flex, Popover, Select, TextField } from '@radix-ui/themes';
import { range } from 'lodash';
import { useEffect, useState } from 'react';
import { RatingsInfo } from '../../../commands/ratings';
import PageWrapper from '../../../components/PageWrapper';
import { REGIONS, REGION_NAMES, Region } from '../../../constants/regions';
import getRatingsInfo from '../../../core/blitz/getRatingsInfo';
import {
  FIRST_ARCHIVED_RATINGS_SEASON,
  getArchivedLatestSeasonNumberAPI,
} from '../../../core/blitzkrieg/getArchivedLatestSeasonNumberAPI';
import { useRatings } from '../../../stores/ratings';

export default function Page() {
  const ratings = useRatings();
  const [ratingsInfo, setRatingsInfo] = useState<RatingsInfo | null>(null);
  const [jumpToLeague, setJumpToLeague] = useState(0);
  const [latestArchivedSeasonNumber, setLatestArchivedSeasonNumber] = useState<
    number | null
  >(null);
  // null being the latest season
  const [season, setSeason] = useState<null | number>(null);

  useEffect(() => {
    (async () => {
      const [newRatingsInfo, newLatestArchivedSeasonNumber] = await Promise.all(
        [getRatingsInfo(ratings.region), getArchivedLatestSeasonNumberAPI()],
      );

      setRatingsInfo(newRatingsInfo);
      setLatestArchivedSeasonNumber(newLatestArchivedSeasonNumber);

      setSeason(
        newRatingsInfo.detail == undefined
          ? null
          : newLatestArchivedSeasonNumber,
      );
    })();
  }, [ratings.region]);

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
    </PageWrapper>
  );
}
