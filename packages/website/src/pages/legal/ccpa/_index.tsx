import { RadioGroup } from '@radix-ui/themes';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { App } from '../../../stores/app';

export function Options() {
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
    <RadioGroup.Root
      value={`${doNotSell}`}
      onValueChange={(value) => setDoNotSell(value === 'true')}
    >
      <RadioGroup.Item value="false">
        My personal information may be used for the purposes defined in the
        privacy policy.
      </RadioGroup.Item>
      <RadioGroup.Item value="true">
        Do not sell my personal information.
      </RadioGroup.Item>
    </RadioGroup.Root>
  );
}
