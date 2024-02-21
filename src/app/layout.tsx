'use client';

import { AlertDialog, Button, Flex, Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { config } from 'dotenv';
import { Roboto_Flex } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import isDev from '../core/blitzkrieg/isDev';
import { isLocalhost } from '../core/blitzkrieg/isLocalhost';
import { useApp } from '../stores/app';

config();

interface RootLayoutProps {
  children: ReactNode;
}

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const isEmbed = pathname.split('/')[1] === 'embeds';
  const [showDevBuildAlert, setShowDevBuildAlert] = useState(false);

  useEffect(() => {
    setShowDevBuildAlert(
      isDev() && !isLocalhost() && !useApp.getState().bypassDevBuildAlert,
    );
  }, []);

  return (
    <html lang="en" className={robotoFlex.className}>
      <head>
        <title>Blitzkrieg</title>
        <meta
          name="description"
          content="🎉 Tools for everything World of Tanks Blitz"
        />
      </head>

      <body
        style={{
          margin: 0,
          paddingTop: isEmbed ? 0 : '3.25rem',
        }}
      >
        <Theme
          appearance="dark"
          panelBackground="translucent"
          radius="full"
          suppressHydrationWarning
          suppressContentEditableWarning
        >
          {!isEmbed && <Navbar />}

          <AlertDialog.Root open={showDevBuildAlert}>
            <AlertDialog.Content>
              <AlertDialog.Title>Experimental version!</AlertDialog.Title>
              <AlertDialog.Description>
                This version may have a lot of issues. Report issues to{' '}
                <a href="https://discord.gg/nDt7AjGJQH" target="_blank">
                  the official Discord server
                </a>
                . Also consider using{' '}
                <a href="https://blitz-krieg.vercel.app/">
                  the more stable version
                </a>
                .
              </AlertDialog.Description>

              <Flex justify="end">
                <Button
                  variant="solid"
                  onClick={() => {
                    setShowDevBuildAlert(false);
                    useApp.setState({ bypassDevBuildAlert: true });
                  }}
                >
                  Continue
                </Button>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>

          <Flex direction="column">{children}</Flex>
        </Theme>
      </body>
    </html>
  );
}
