'use client';

import { CaretRightIcon } from '@radix-ui/react-icons';
import { AlertDialog, Button, Flex, Text, Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { config } from 'dotenv';
import { Roboto_Flex } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { SkyLine } from '../assets/art/SkyLine';
import { Analytics } from '../components/Analytics';
import Navbar from '../components/Navbar';
import PageWrapper from '../components/PageWrapper';
import isDev from '../core/blitzkrieg/isDev';
import { isLocalhost } from '../core/blitzkrieg/isLocalhost';
import { useFullScreen } from '../hooks/useFullScreen';
import { useApp } from '../stores/app';
import { mintTheme } from '../themes/mint';

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
        <title>Blitzkrieg</title>
        <meta
          name="description"
          content="🎉 Tools for everything World of Tanks Blitz"
        />
        <Analytics />
      </head>

      <body
        style={{
          margin: 0,
          paddingTop: isEmbed ? 0 : '3.25rem',
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

          <Flex direction="column">{children}</Flex>

          {!isEmbed && !isFullScreen && (
            <PageWrapper>
              <a
                target="_blank"
                href="https://www.patreon.com/tresabhi"
                style={{ textDecoration: 'none' }}
              >
                <Flex
                  align="center"
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: mintTheme.colors.componentInteractive,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Flex
                    direction="column"
                    gap="1"
                    style={{
                      flex: 1,
                      zIndex: 1,
                    }}
                  >
                    <Text size="4" color="mint">
                      Blitzkrieg. Free forever. For everyone.
                    </Text>
                    <Text color="mint">
                      <b>Consider supporting today 🍀</b>
                    </Text>
                  </Flex>

                  <Text
                    color="mint"
                    style={{
                      zIndex: 1,
                    }}
                  >
                    <Flex>
                      <CaretRightIcon width={32} height={32} />
                    </Flex>
                  </Text>

                  <SkyLine
                    style={{
                      position: 'absolute',
                      right: 'min(8vw, 15%)',
                      top: '5%',
                    }}
                  />
                </Flex>
              </a>
            </PageWrapper>
          )}
        </Theme>
      </body>
    </html>
  );
}
