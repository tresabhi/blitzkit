'use client';

import { AlertDialog, Button, Flex } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { extendAuth } from '../../core/blitz/extendAuth';
import { logout } from '../../core/blitz/logout';
import isDev from '../../core/blitzkit/isDev';
import { isLocalhost } from '../../core/blitzkit/isLocalhost';
import { useApp } from '../../stores/app';

const DEV_BUILD_AGREEMENT_COOLDOWN = 8 * 24 * 60 * 60 * 1000;

export function Checks() {
  const [showDevBuildAlert, setShowDevBuildAlert] = useState(false);
  const login = useApp((state) => state.login);

  useEffect(() => {
    setShowDevBuildAlert(
      isDev() &&
        !isLocalhost() &&
        Date.now() - useApp.getState().devBuildAgreementTime >=
          DEV_BUILD_AGREEMENT_COOLDOWN,
    );
  }, []);

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
  );
}
