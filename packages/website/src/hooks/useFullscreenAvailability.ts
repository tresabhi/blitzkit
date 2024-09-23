import { useEffect, useState } from 'react';

export function useFullscreenAvailability() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(document.fullscreenEnabled);
  }, []);

  return available;
}
