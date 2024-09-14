'use client';

import { Flex, Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { Roboto_Flex } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { Party3 } from '../components/Party3';
import * as App from '../stores/app';
import { Checks } from './components/Checks';
import { PageLoader } from './components/PageLoader';
import './layout.css';

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-flex',
});

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNav = false;
  const isRoot = pathname === '/';

  return (
    <App.Provider>
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
          <link rel="icon" type="image/x-icon" href="/favicon.png" />

          <Party3 />
        </head>

        <body
          style={{
            margin: 0,
            backgroundColor: hideNav ? 'transparent' : undefined,
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
                // paddingTop: isEmbed ? undefined : NAVBAR_HEIGHT,
              }}
            >
              {!hideNav && <Navbar />}

              <Checks />

              <Suspense fallback={<PageLoader />}>{children}</Suspense>

              {!hideNav && <Footer />}
            </Flex>
          </Theme>
        </body>
      </html>
    </App.Provider>
  );
}
