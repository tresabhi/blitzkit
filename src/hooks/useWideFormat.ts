import { useEffect, useState } from 'react';

function hasWideFormat() {
  return typeof window !== 'undefined' && window.innerWidth > 880;
}

export function useWideFormat() {
  const [wideFormat, setWideFormat] = useState(hasWideFormat());

  useEffect(() => {
    function handleResize() {
      setWideFormat(hasWideFormat());
    }

    window.addEventListener('resize', handleResize);
  }, []);

  return wideFormat;
}
