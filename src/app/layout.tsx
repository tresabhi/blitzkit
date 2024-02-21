'use client';

import { Flex, Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { config } from 'dotenv';
import { Roboto_Flex } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Navbar from '../components/Navbar';

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
        {/* <AlertDialog.Root open>
          <AlertDialog.Content>
            <AlertDialog.Title>Peepee</AlertDialog.Title>
          </AlertDialog.Content>
        </AlertDialog.Root> */}

        <Theme
          appearance="dark"
          panelBackground="translucent"
          radius="full"
          suppressHydrationWarning
          suppressContentEditableWarning
        >
          {!isEmbed && <Navbar />}

          <Flex direction="column">{children}</Flex>
        </Theme>
      </body>
    </html>
  );
}
