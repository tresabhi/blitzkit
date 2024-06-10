'use client';

import { ComponentProps, useEffect } from 'react';

export enum AdType {
  TankopediaHorizontal800 = 738182777,
}

interface AdProps extends ComponentProps<'div'> {
  type: AdType;
}

export function Ad({ type, ...props }: AdProps) {
  useEffect(() => {
    (window as any).msAdsQueue.push(function () {
      (window as any).mmnow.render({ adUnitId: type, elementId: type });
    });
  });

  return <div id={`${type}`} {...props} />;
}
