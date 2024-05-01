import { ExitIcon } from '@radix-ui/react-icons';
import { Flex, IconButton, Text } from '@radix-ui/themes';
import { use } from 'react';
import { getAccountInfo } from '../../../core/blitz/getAccountInfo';
import { idToRegion } from '../../../core/blitz/idToRegion';
import { logout } from '../../../core/blitz/logout';
import { useApp } from '../../../stores/app';

export function LoggedIn() {
  const login = useApp((state) => state.login!);
  const accountInfo = use(getAccountInfo(idToRegion(login.id), login.id));

  return (
    <Flex gap="3" align="center">
      <Text>Hello, {accountInfo.nickname}</Text>

      <IconButton variant="ghost" color="red" onClick={logout}>
        <ExitIcon />
      </IconButton>
    </Flex>
  );
}
