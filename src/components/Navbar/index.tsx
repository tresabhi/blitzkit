import { HamburgerMenuIcon, PersonIcon } from '@radix-ui/react-icons';
import { theme } from '../../stitches.config';
import { BlitzkriegWormWide } from '../BlitzkriegWormWide';
import { Button } from './components/Button';

export default function Navbar() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: theme.colors.textHighContrast,
        backgroundColor: theme.colors.appBackground2,
      }}
    >
      <Button>
        <HamburgerMenuIcon />
      </Button>
      <BlitzkriegWormWide />
      <Button>
        <PersonIcon />
      </Button>
    </div>
  );
}
