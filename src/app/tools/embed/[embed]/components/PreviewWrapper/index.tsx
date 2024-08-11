import { Box } from '@radix-ui/themes';
import { useEffect, useRef } from 'react';
import { useEmbedStateCurry } from '../../../../../../stores/embedState/utilities';
import { previews } from '../../../configurations';
import * as styles from './index.css';

interface PreviewWrapperProps {
  name: keyof typeof previews;
}

export function PreviewWrapper({ name }: PreviewWrapperProps) {
  const { useState } = useEmbedStateCurry();
  const width = useState('width');
  const height = useState('height');
  const Preview = previews[name];
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapper.current) return;

    wrapper.current.classList.remove(styles.animated);
    void wrapper.current.offsetWidth;
    wrapper.current.classList.add(styles.animated);
  }, [width, height]);

  return (
    <Box
      ref={wrapper}
      className={styles.wrapper}
      width={`${width}px`}
      height={`${height}px`}
    >
      <Preview />
    </Box>
  );
}
