import { Roboto_Flex } from 'next/font/google';
import { ReactNode } from 'react';
import Navbar from '../components/Navbar';

interface RootLayoutProps {
  children: ReactNode;
}

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={robotoFlex.className}>
      <body
        style={{
          margin: 0,
          background: 'url(https://i.imgur.com/PhS06NJ.png)',
        }}
      >
        <Navbar />

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
