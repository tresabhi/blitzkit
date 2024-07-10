import { useLayoutEffect, useState } from 'react';

export function useFullscreenAvailability() {
  const [available, setAvailable] = useState(false);

  useLayoutEffect(() => {
    setAvailable(document.fullscreenEnabled);
  }, []);

  return available;
}
