'use client';

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
      <body
        style={{
          margin: 0,
          background: isEmbed
            ? 'transparent'
            : 'url(https://i.imgur.com/PhS06NJ.png)',
        }}
      >
        {!isEmbed && <Navbar />}

        <div
          style={{
            flex: 1,
            width: '100%',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
