import { useEffect, useState } from 'react';

export function useFullscreenAvailability(assumption = false) {
  const [available, setAvailable] = useState(assumption);

  useEffect(() => {
    setAvailable(document.fullscreenEnabled);
  }, []);

  return available;
}
