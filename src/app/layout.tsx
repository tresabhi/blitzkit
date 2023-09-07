import { ReactNode } from 'react';
import Navbar from '../components/Navbar';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html>
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
          }}
        >
          <Navbar />

          {children}
        </div>
      </body>
    </html>
  );
}
