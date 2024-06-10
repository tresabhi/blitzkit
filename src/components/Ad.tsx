'use client';

import { uniqueId } from 'lodash';
import { ComponentProps, useEffect, useRef } from 'react';

export enum AdType {
  TankopediaHorizontal800 = 738182777,
}

interface AdProps extends ComponentProps<'div'> {
  type: AdType;
}

export function Ad({ type, ...props }: AdProps) {
  const id = useRef(uniqueId());

  useEffect(() => {
    (window as any).msAdsQueue.push(function () {
      (window as any).mmnow.render({
        adUnitId: type,
        elementId: `${type}-${id.current}`,
      });
    });
  });

  return <div id={`${type}-${id.current}`} {...props} />;
}
