import { Flex, Switch, Text } from '@radix-ui/themes';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { App } from '../../../stores/app';

export function Toggles() {
  return (
    <App.Provider>
      <Content />
    </App.Provider>
  );
}

function Content() {
  const [doNotSell, setDoNotSell] = useState(false);

  useEffect(() => {
    setDoNotSell(Cookies.get('CCPAOPTOUT') !== undefined);
  }, []);

  useEffect(() => {
    if (doNotSell) {
      Cookies.set('CCPAOPTOUT', 'true', { sameSite: 'Lax', expires: Infinity });
    } else {
      Cookies.remove('CCPAOPTOUT');
    }
  }, [doNotSell]);

  return (
    <Flex gap="2" align="center">
      <Text>Do not sell my personal information</Text>
      <Switch checked={doNotSell} onCheckedChange={setDoNotSell} />
    </Flex>
  );
}
