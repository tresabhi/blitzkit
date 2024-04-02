import { useEffect, useState } from 'react';

export function useFullScreen() {
  const [isFullScreen, setIsFullScreen] = useState(
    document.fullscreenElement !== null,
  );

  useEffect(() => {
    function handleFullScreenChange() {
      setIsFullScreen(document.fullscreenElement !== null);
    }

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  return isFullScreen;
}
