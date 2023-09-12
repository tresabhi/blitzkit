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
        }}
      >
        <div
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'url(https://i.imgur.com/PhS06NJ.png)',
            alignItems: 'center',
          }}
        >
          <Navbar />

          <div style={{ flex: 1, maxWidth: 780, width: '100%' }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
