'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { TOOLS } from '../../constants/tools';
import { theme } from '../../stitches.config';

interface ToolsLayoutProps {
  children: ReactNode;
}

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  const pathname = usePathname();
  const toolId = pathname.split('/').at(2);
  const tool = TOOLS.find((tool) => tool.id === toolId);

  return (
    <>
      <div
        style={{
          height: 128,
          boxShadow: `inset 0 -192px 128px -128px ${theme.colors.appBackground1}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            backgroundImage: `url(/assets/banners/${toolId}.webp)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            zIndex: -1,
            filter: 'blur(4px)',
            transform: 'scale(calc((128 + 8) / 128))',
          }}
        />

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
