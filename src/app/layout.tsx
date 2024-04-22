'use client';

import { AlertDialog, Button, Flex, Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { config } from 'dotenv';
import { Roboto_Flex } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { ReactNode, Suspense, useEffect, useState } from 'react';
import { Footer } from '../components/Footer';
import { Loader } from '../components/Loader';
import Navbar from '../components/Navbar';
import { Party3 } from '../components/Party3';
import isDev from '../core/blitzrinth/isDev';
import { isLocalhost } from '../core/blitzrinth/isLocalhost';
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
  const darkMode = useApp((state) => state.darkMode);
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
        {isRoot && (
          <>
            <title>Blitzrinth</title>
            <meta
              name="description"
              content="🎉 Tools for everything World of Tanks Blitz"
            />
          </>
        )}
        <meta property="og:site_name" content="Blitzrinth" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />

        <Party3 />
      </head>

      <body
        style={{
          margin: 0,
          backgroundColor: isEmbed ? 'transparent' : undefined,
        }}
      >
        <Theme
          appearance={darkMode ? 'dark' : 'light'}
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
                  <a href="https://blitzrinth.vercel.app/">
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

            <Suspense
              fallback={
                <div style={{ flex: 1 }}>
                  <Loader />
                </div>
              }
            >
              {children}
            </Suspense>

            {!isEmbed && !isFullScreen && <Footer />}
          </Flex>
        </Theme>
      </body>
    </html>
  );
}
