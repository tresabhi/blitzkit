'use client';

import { idToRegion } from '@blitzkit/core';
import { Button, Flex, Heading, Link, Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { App } from '../stores/app';
import { CURRENT_POLICIES_AGREEMENT_INDEX } from '../stores/app/constants';

type Extension =
  | {
      status: 'ok';
      data: {
        access_token: string;
        account_id: number;
        expires_at: number;
      };
    }
  | {
      status: 'error';
    };

export function Checks() {
  return (
    <App.Provider>
      <Content />
    </App.Provider>
  );
}

/**
 * Wargaming: 14 (refresh: 7)
 */
function Content() {
  const logins = App.use((state) => state.logins);
  const mutateApp = App.useMutation();
  const appStore = App.useStore();
  const policiesAgreementIndex = App.use(
    (state) => state.policiesAgreementIndex,
  );
  const isLegal = window.location.pathname.startsWith('/legal');
  const [showPoliciesAgreement, setShowPoliciesAgreement] = useState(false);

  useEffect(() => {
    function unsubscribe() {
      window.removeEventListener('scroll', show);
      window.removeEventListener('pointermove', show);
      window.removeEventListener('pointerdown', show);
    }

    function show() {
      setShowPoliciesAgreement(true);
      unsubscribe();
    }

    if (
      policiesAgreementIndex !== CURRENT_POLICIES_AGREEMENT_INDEX &&
      !isLegal
    ) {
      window.addEventListener('scroll', show);
      window.addEventListener('pointermove', show);
      window.addEventListener('pointerdown', show);
    }

    return unsubscribe;
  }, [policiesAgreementIndex, isLegal]);

  useEffect(() => {
    if (logins.wargaming) {
      const expiresIn = logins.wargaming.expires - Date.now();
      const expiresInDays = expiresIn / 1000 / 60 / 60 / 24;

      if (expiresInDays < 0) {
        mutateApp((draft) => {
          draft.logins.wargaming = undefined;
        });
      } else if (expiresInDays < 7) {
        const { wargaming } = appStore.getState().logins;

        if (!wargaming) return;

        fetch(
          `https://api.worldoftanks.${idToRegion(
            wargaming.id,
          )}/wot/auth/prolongate/?application_id=${
            import.meta.env.PUBLIC_WARGAMING_APPLICATION_ID
          }&access_token=${wargaming.token}`,
        )
          .then((response) => response.json() as Promise<Extension>)
          .then((json) => {
            mutateApp((draft) => {
              if (json.status === 'error') {
                draft.logins.wargaming = undefined;
              } else {
                draft.logins.wargaming = {
                  id: wargaming.id,
                  token: json.data.access_token,
                  expires: json.data.expires_at * 1000,
                };
              }
            });
          });
      }
    }
  });

  if (!showPoliciesAgreement) return null;

  return (
    <Flex
      align="end"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'var(--color-overlay)',
        zIndex: 2,
      }}
    >
      <Flex
        p="8"
        style={{
          width: '100%',
          background: 'var(--color-panel-solid)',
        }}
        justify="center"
      >
        <Flex
          align="start"
          gap="4"
          style={{
            maxWidth: 640 * 2,
          }}
          direction="column"
        >
          <Flex direction="column" gap="2">
            <Heading>
              {policiesAgreementIndex === -1
                ? "BlitzKit's policies"
                : "BlitzKit's policies have changed"}
            </Heading>

            <Text>
              This website utilizes cookies to perform analytics and personalize
              your experience. You can learn more through{' '}
              <Link href="/docs/legal/privacy-policy">our privacy policy</Link>.
              You may opt out of personalized advertizement by visiting{' '}
              <Link href="https://optout.aboutads.info/">WebChoices</Link>. By
              using BlitzKit, you also agree to our{' '}
              <Link href="/docs/legal/terms-of-service">terms of service</Link>.
            </Text>
          </Flex>

          <Button
            mt="2"
            onClick={() => {
              appStore.setState({
                policiesAgreementIndex: CURRENT_POLICIES_AGREEMENT_INDEX,
              });
              setShowPoliciesAgreement(false);
            }}
          >
            I agree
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
