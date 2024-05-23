'use client';

import { Flex, Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { config } from 'dotenv';
import { Roboto_Flex } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Navbar, { NAVBAR_HEIGHT } from '../components/Navbar';
import { Party3 } from '../components/Party3';
import { Checks } from './components/Checks';
import './layout.css';

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
  const isRoot = pathname === '/';

  return (
    <html lang="en" className={robotoFlex.className}>
      <head>
        {isRoot && (
          <>
            <title>BlitzKit</title>
            <meta
              name="description"
              content="🎉 Tools for everything World of Tanks Blitz"
            />
          </>
        )}
        <meta property="og:site_name" content="BlitzKit" />
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
          appearance="dark"
          panelBackground="solid"
          radius="full"
          accentColor="amber"
          suppressHydrationWarning
          suppressContentEditableWarning
        >
          <Flex
            direction="column"
            style={{
              minHeight: '100vh',
              paddingTop: isEmbed ? undefined : NAVBAR_HEIGHT,
            }}
          >
            {!isEmbed && <Navbar />}

            <Checks />

            {/* <Suspense
              fallback={
                <div style={{ flex: 1 }}>
                  <Loader />
                </div>
              }
            >
              {children}
            </Suspense> */}

            {/* {!isEmbed && <Footer />} */}
          </Flex>
        </Theme>
      </body>
    </html>
  );
}
