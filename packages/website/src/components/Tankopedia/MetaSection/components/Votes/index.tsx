import { formatCompact } from '@blitzkit/core';
import { Flex, Heading, Skeleton, Text } from '@radix-ui/themes';
import { memo } from 'react';
import { useLocale } from '../../../../../hooks/useLocale';
import { useTankVotes } from '../../../../../hooks/useTankVotes';
import { App } from '../../../../../stores/app';
import { Duel } from '../../../../../stores/duel';
import { WargamingLoginButton } from '../../../../WargamingLoginButton';
import { StarRow } from './components/StarRow';
import { VoteCaster } from './components/VoteCaster';

export const Votes = memo(
  () => {
    const id = Duel.use((state) => state.protagonist.tank.id);
    const votes = useTankVotes(id);
    const wargaming = App.use((state) => state.logins.wargaming);
    const { locale } = useLocale();

    return (
      <Flex direction="column" gap="3">
        <Flex justify="between" align="center">
          <Heading size="4">
            {!votes && <Skeleton height="1em" width="4rem" />}
            {votes && formatCompact(locale, votes.votes)}{' '}
            {votes && (votes.votes > 1 ? 'votes' : 'vote')}
          </Heading>

          {!wargaming && (
            <WargamingLoginButton variant="surface">
              Login to vote
            </WargamingLoginButton>
          )}
          {wargaming && <VoteCaster />}
        </Flex>

        <Flex gap="0" direction="column">
          <Flex
            gap={{ initial: '0', sm: '6' }}
            direction={{ initial: 'column', sm: 'row' }}
          >
            <StarRow
              stars={votes?.categories.easiness ?? null}
              children="Easiness"
            />
            <StarRow
              stars={votes?.categories.firepower ?? null}
              children="Firepower"
            />
          </Flex>

          <Flex
            gap={{ initial: '0', sm: '6' }}
            direction={{ initial: 'column', sm: 'row' }}
          >
            <StarRow
              stars={votes?.categories.maneuverability ?? null}
              children="Maneuverability"
            />
            <StarRow
              stars={votes?.categories.survivability ?? null}
              children="Survivability"
            />
          </Flex>

          <Flex justify="center">
            <Text size="2" color="gray" mt="2">
              <>
                {votes ? (
                  wargaming ? (
                    votes.last_updated ? (
                      `You voted on ${new Date(
                        votes.last_updated,
                      ).toLocaleDateString()}`
                    ) : (
                      `You haven't voted yet`
                    )
                  ) : (
                    'Login to vote'
                  )
                ) : (
                  <Skeleton height="1em" width="5rem" />
                )}
              </>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    );
  },
  () => true,
);
