import { useEffect, useState } from 'react';

export function useWideFormat(size = 880) {
  function hasWideFormat() {
    return typeof window !== 'undefined' && window.innerWidth > size;
  }

  const [wideFormat, setWideFormat] = useState(hasWideFormat());

  useEffect(() => {
    function handleResize() {
      setWideFormat(hasWideFormat());
    }

    window.addEventListener('resize', handleResize);
  }, []);

  return wideFormat;
}
