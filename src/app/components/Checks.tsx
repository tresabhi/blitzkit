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
import { extendAuth } from '../../core/blitz/extendAuth';
import { logout } from '../../core/blitz/logout';
import isDev from '../../core/blitzkit/isDev';
import { isLocalhost } from '../../core/blitzkit/isLocalhost';
import { CURRENT_POLICIES_AGREEMENT_INDEX, useApp } from '../../stores/app';

const DEV_BUILD_AGREEMENT_COOLDOWN = 8 * 24 * 60 * 60 * 1000;

export function Checks() {
  const [showDevBuildAlert, setShowDevBuildAlert] = useState(false);
  const login = useApp((state) => state.login);
  const policiesAgreementIndex = useApp(
    (state) => state.policiesAgreementIndex,
  );
  const pathname = usePathname();
  const isLegal = pathname.startsWith('/legal');
  const [showPoliciesAgreement, setShowPoliciesAgreement] = useState(false);

  useEffect(() => {
    setShowDevBuildAlert(
      isDev() &&
        !isLocalhost() &&
        Date.now() - useApp.getState().devBuildAgreementTime >=
          DEV_BUILD_AGREEMENT_COOLDOWN,
    );
  }, []);
  useEffect(() => {
    setShowPoliciesAgreement(
      policiesAgreementIndex !== CURRENT_POLICIES_AGREEMENT_INDEX && !isLegal,
    );
  }, [policiesAgreementIndex, isLegal]);

  useEffect(() => {
    if (!login) return;

    const expiresIn = login.expiresAt - Date.now() / 1000;
    const expiresInDays = expiresIn / 60 / 60 / 24;

    if (expiresInDays < 0) {
      logout();
    } else if (expiresInDays < 7) {
      extendAuth();
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
                useApp.setState({ devBuildAgreementTime: Date.now() });
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
                    ? "BlitzKit's cookies"
                    : "BlitzKit's policies have changed"}
                </Heading>

                <Text>
                  This website utilizes cookies to perform analytics and
                  personalize your experience. You can learn more through{' '}
                  <Link href="/legal/privacy-policy">our privacy policy</Link>.
                  You may opt out of personalized advertizement by visiting{' '}
                  <Link href="https://www.google.com/settings/ads">
                    Google Ad Settings
                  </Link>
                  . By using BlitzKit, you also agree to our{' '}
                  <Link href="/legal/terms-of-service">terms of service</Link>.
                </Text>
              </Flex>

              <Button
                onClick={() => {
                  useApp.setState({
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
