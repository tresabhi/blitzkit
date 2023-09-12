import { HamburgerMenuIcon, PersonIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { theme } from '../../stitches.config';
import { BlitzkriegWormWide } from '../BlitzkriegWormWide';
import { Button } from './components/Button';

export default function Navbar() {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: theme.colors.textHighContrast,
        backgroundColor: theme.colors.appBackground2,
        borderBottom: theme.borderStyles.nonInteractive,
      }}
    >
      <Button>
        <HamburgerMenuIcon />
      </Button>
      <Link href="/" style={{ color: 'inherit' }}>
        <BlitzkriegWormWide />
      </Link>
      <Button>
        <PersonIcon />
      </Button>
    </div>
  );
}
