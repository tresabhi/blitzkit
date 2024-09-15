import { getAccountInfo, idToRegion } from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { Text } from '@radix-ui/themes';
import { useMemo } from 'react';
import usePromise from 'react-promise-suspense';
import { $wargamingLogin } from '../../../stores/wargamingLogin';

export function WargamingAccountName() {
  const wargamingLogin = useStore($wargamingLogin);
  const promise = useMemo(async () => {
    if (!wargamingLogin.token) return null;

    const data = await getAccountInfo(
      idToRegion(Number(wargamingLogin.id)),
      Number(wargamingLogin.id),
      [],
      {
        access_token: wargamingLogin.token,
      },
    );

    return data?.nickname as string | undefined;
  }, [wargamingLogin.token]);
  const nickname = usePromise(() => promise, []);

  return nickname ?? <Text color="gray">Unknown Account</Text>;
}
