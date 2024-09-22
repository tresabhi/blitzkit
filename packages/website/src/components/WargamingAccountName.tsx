import { getAccountInfo, idToRegion } from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { Text } from '@radix-ui/themes';
import { useMemo } from 'react';
import usePromise from 'react-promise-suspense';
import { $wargamingLogin } from '../stores/wargamingLogin';

export function WargamingAccountName() {
  const wargaming = useStore($wargamingLogin);
  const promise = useMemo(async () => {
    if (!wargaming.token) return null;

    const data = await getAccountInfo(
      idToRegion(Number(wargaming.id)),
      Number(wargaming.id),
      [],
      {
        access_token: wargaming.token,
      },
    );

    return data?.nickname as string | undefined;
  }, [wargaming]);
  const nickname = usePromise(() => promise, []);

  return nickname ?? <Text color="gray">Unknown Account</Text>;
}
