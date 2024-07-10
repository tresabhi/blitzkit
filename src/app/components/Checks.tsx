'use client';

import {
  AlertDialog,
  Button,
  Flex,
  Heading,
  Link,
  Text,
} from '@radix-ui/themes';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import { idToRegion } from '../../core/blitz/idToRegion';
import isDev from '../../core/blitzkit/isDev';
import { isLocalhost } from '../../core/blitzkit/isLocalhost';
import * as App from '../../stores/app';
import { CURRENT_POLICIES_AGREEMENT_INDEX } from '../../stores/app/constants';
import { PatreonAuthResponse } from '../auth/[provider]/page';

interface Extension {
  data: {
    access_token: string;
    account_id: number;
    expires_at: number;
  };
}

const DEV_BUILD_AGREEMENT_COOLDOWN = 8 * 24 * 60 * 60 * 1000;

/**
 * Wargaming: 14 (refresh: 7)
 * Patreon: 31 (refresh: 15)
 */

export function Checks() {
  const [showDevBuildAlert, setShowDevBuildAlert] = useState(false);
  const mutateApp = App.useMutation();
  const logins = App.use((state) => state.logins);
  const appStore = App.useStore();
  const policiesAgreementIndex = App.use(
    (state) => state.policiesAgreementIndex,
  );
  const pathname = usePathname();
  const isLegal = pathname.startsWith('/legal');
  const [showPoliciesAgreement, setShowPoliciesAgreement] = useState(false);

  useEffect(() => {
    setShowDevBuildAlert(
      isDev() &&
        !isLocalhost() &&
        Date.now() - appStore.getState().devBuildAgreementTime >=
          DEV_BUILD_AGREEMENT_COOLDOWN,
    );
  }, []);
  useEffect(() => {
    setShowPoliciesAgreement(
      policiesAgreementIndex !== CURRENT_POLICIES_AGREEMENT_INDEX && !isLegal,
    );
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
          )}/wot/auth/prolongate/?application_id=${WARGAMING_APPLICATION_ID}&access_token=${
            wargaming.token
          }`,
        )
          .then((response) => response.json() as Promise<Extension>)
          .then((json) => {
            mutateApp((draft) => {
              draft.logins.wargaming = {
                id: wargaming.id,
                token: json.data.access_token,
                expires: json.data.expires_at * 1000,
              };
            });
          });
      }
    }

    if (logins.patreon) {
      const expiresIn = logins.patreon.expires - Date.now();
      const expiresInDays = expiresIn / 1000 / 60 / 60 / 24;

      if (expiresInDays < 0) {
        mutateApp((draft) => {
          draft.logins.patreon = undefined;
        });
      } else if (expiresInDays < 15) {
        const { patreon } = appStore.getState().logins;

        if (!patreon) return;

        fetch(`/api/patreon/refresh/${patreon.refreshToken}`)
          .then((response) => response.json() as Promise<PatreonAuthResponse>)
          .then((data) => {
            mutateApp((draft) => {
              draft.logins.patreon = {
                token: data.access_token,
                refreshToken: data.refresh_token,
                expires: Date.now() + data.expires_in * 1000,
              };
            });
          });
      }
    }
  });

  return (
    <>
      <AlertDialog.Root open={showDevBuildAlert}>
        <AlertDialog.Content>
          <AlertDialog.Title>Experimental version!</AlertDialog.Title>
          <AlertDialog.Description>
            This version may have a lot of issues. Report issues to{' '}
            <a href="https://discord.gg/nDt7AjGJQH" target="_blank">
              the official Discord server
            </a>
            . Also consider using{' '}
            <a href="https://blitzkit.app/">the more stable release version</a>.
            You will be asked again in 8 days.
          </AlertDialog.Description>

          <Flex justify="end">
            <Button
              variant="solid"
              onClick={() => {
                setShowDevBuildAlert(false);
                appStore.setState({ devBuildAgreementTime: Date.now() });
              }}
            >
              Continue
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      {showPoliciesAgreement && (
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
                  This website utilizes cookies to perform analytics and
                  personalize your experience. You can learn more through{' '}
                  <Link href="/docs/legal/privacy-policy">
                    our privacy policy
                  </Link>
                  . You may opt out of personalized advertizement by visiting{' '}
                  <Link href="https://www.google.com/settings/ads">
                    Google Ad Settings
                  </Link>
                  . By using BlitzKit, you also agree to our{' '}
                  <Link href="/docs/legal/terms-of-service">
                    terms of service
                  </Link>
                  .
                </Text>
              </Flex>

              <Button
                onClick={() => {
                  appStore.setState({
                    policiesAgreementIndex: CURRENT_POLICIES_AGREEMENT_INDEX,
                  });
                }}
              >
                I Agree
              </Button>
            </Flex>
          </Flex>
        </Flex>
      )}
    </>
  );
}
