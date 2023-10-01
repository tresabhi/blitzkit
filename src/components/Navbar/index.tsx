import Link from 'next/link';
import { theme } from '../../stitches.config';
import { BlitzkriegWormWide } from '../BlitzkriegWormWide';

export default function Navbar() {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.colors.textHighContrast,
        backgroundColor: theme.colors.appBackground2,
        borderBottom: theme.borderStyles.nonInteractive,
        height: 48, // TODO: remove this when the icons are implemented
      }}
    >
      {/* <Button>
        <HamburgerMenuIcon />
      </Button> */}
      <Link
        href="/"
        style={{
          color: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BlitzkriegWormWide />
      </Link>
      {/* <Button>
        <PersonIcon />
      </Button> */}
    </div>
  );
}
