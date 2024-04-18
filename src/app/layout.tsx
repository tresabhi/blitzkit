'use client';

import { AlertDialog, Button, Flex, Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { config } from 'dotenv';
import { Roboto_Flex } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { Footer } from '../components/Footer';
import { Google } from '../components/Google';
import Navbar from '../components/Navbar';
import isDev from '../core/blitzkrieg/isDev';
import { isLocalhost } from '../core/blitzkrieg/isLocalhost';
import { useFullScreen } from '../hooks/useFullScreen';
import { useApp } from '../stores/app';

config();

const DEV_BUILD_AGREEMENT_COOLDOWN = 8 * 24 * 60 * 60 * 1000;

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
  const isRoot = pathname === '/';
  const [showDevBuildAlert, setShowDevBuildAlert] = useState(false);
  const isFullScreen = useFullScreen();

  useEffect(() => {
    setShowDevBuildAlert(
      isDev() &&
        !isLocalhost() &&
        Date.now() - useApp.getState().devBuildAgreementTime >=
          DEV_BUILD_AGREEMENT_COOLDOWN,
    );
  }, []);

  return (
    <html lang="en" className={robotoFlex.className}>
      <head>
        {isRoot && <title>Blitzkrieg</title>}
        <meta
          name="description"
          content="🎉 Tools for everything World of Tanks Blitz"
        />
        <meta property="og:site_name" content="Blitzkrieg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />

        <Google />
      </head>

      <body
        style={{
          margin: 0,
          backgroundColor: isEmbed ? 'transparent' : undefined,
        }}
      >
        <Theme
          appearance="dark"
          panelBackground="solid"
          radius="full"
          suppressHydrationWarning
          suppressContentEditableWarning
        >
          <Flex
            direction="column"
            style={{ minHeight: '100vh', paddingTop: isEmbed ? undefined : 64 }}
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
                    the more stable release version
                  </a>
                  . You will be asked again in 8 days.
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

            {children}

            {!isEmbed && !isFullScreen && <Footer />}
          </Flex>
        </Theme>
      </body>
    </html>
  );
}
