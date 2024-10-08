import { Text } from '@radix-ui/themes';
import { use, useMemo } from 'react';
import { getAccountInfo } from '../../../core/blitz/getAccountInfo';
import { idToRegion } from '../../../core/blitz/idToRegion';
import * as App from '../../../stores/app';

export function WargamingAccountName() {
  const wargaming = App.use((state) => state.logins.wargaming!);
  const promise = useMemo(
    () =>
      getAccountInfo(idToRegion(wargaming.id), wargaming.id, [], {
        access_token: wargaming.token,
      }).then((data) => {
        console.log(data);
        return data?.nickname as string | undefined;
      }),
    [wargaming],
  );
  const nickname = use(promise);

  return nickname ?? <Text color="gray">Unknown Account</Text>;
}
