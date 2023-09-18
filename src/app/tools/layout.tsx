'use client';

import { ReactNode } from 'react';
import { theme } from '../../stitches.config';
import { TOOLS } from '../page';

interface ToolsLayoutProps {
  children: ReactNode;
}

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  const toolId = location.pathname.split('/').at(-1);
  const tool = TOOLS.find((tool) => tool.id === toolId);

  return (
    <>
      <div
        style={{
          height: 128,
          backgroundImage: `url(/assets/banners/${toolId}.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: `inset 0 -192px 128px -128px ${theme.colors.appBackground1}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          flexDirection: 'column',
        }}
      >
        <span
          style={{
            color: theme.colors.textHighContrast,
            fontSize: 32,
          }}
        >
          {tool?.title}
        </span>
        <span
          style={{
            color: theme.colors.textLowContrast,
            fontSize: 16,
          }}
        >
          {tool?.description}
        </span>
      </div>

      {children}
    </>
  );
}
