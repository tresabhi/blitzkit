'use client';

import { Flex, Select } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { RatingsInfo } from '../../../commands/ratings';
import PageWrapper from '../../../components/PageWrapper';
import { Region } from '../../../constants/regions';
import getRatingsInfo from '../../../core/blitz/getRatingsInfo';
import { RatingsType, useRatings } from '../../../stores/ratings';

export default function Page() {
  const ratings = useRatings();
  const [awaitedRatingsInfo, setRatingsInfo] = useState<RatingsInfo | null>(
    null,
  );

  useEffect(() => {
    getRatingsInfo(ratings.region).then(setRatingsInfo);
  }, [ratings.region]);

  return (
    <PageWrapper>
      <Flex gap="2">
        <Select.Root
          defaultValue={ratings.region}
          onValueChange={(value) =>
            useRatings.setState({ region: value as Region })
          }
        >
          <Select.Trigger style={{ flex: 1 }} />

          <Select.Content>
            <Select.Item value="com">North America</Select.Item>
            <Select.Item value="eu">Europe</Select.Item>
            <Select.Item value="asia">Asia</Select.Item>
          </Select.Content>
        </Select.Root>
        <Select.Root
          defaultValue={ratings.type}
          onValueChange={(value) =>
            useRatings.setState({ type: value as RatingsType })
          }
        >
          <Select.Trigger style={{ flex: 1 }} />

          <Select.Content>
            <Select.Item value="league">League</Select.Item>
            <Select.Item value="neighbors">Neighbors</Select.Item>
          </Select.Content>
        </Select.Root>

        {ratings.type === 'league' ? (
          <Select.Root
            defaultValue={`${ratings.league}`}
            onValueChange={(value) =>
              useRatings.setState({ league: parseInt(value) })
            }
          >
            <Select.Trigger style={{ flex: 1 }} />

            <Select.Content>
              {awaitedRatingsInfo?.detail === undefined &&
                awaitedRatingsInfo?.leagues.map((league) => (
                  <Select.Item key={league.index} value={`${league.index}`}>
                    {league.title}
                  </Select.Item>
                ))}
            </Select.Content>
          </Select.Root>
        ) : (
          '1'
        )}
      </Flex>
    </PageWrapper>
  );
}
