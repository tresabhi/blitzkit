'use client';

import { imgur, ImgurSize } from '@blitzkit/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { TOOLS } from '../../constants/tools';

interface ToolsLayoutProps {
  children: ReactNode;
}

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  const pathname = usePathname();
  const pathSplit = pathname.split('/');
  const toolId = pathSplit.at(2);
  const isToolRoot = pathname === `/tools/${toolId}`;
  const tool = TOOLS.find((tool) => tool.id === toolId);

  return (
    <>
      {tool && (
        <>
          {isToolRoot && (
            <>
              <title>{tool.title}</title>
              <meta property="og:image" content={imgur(tool.image)} />

              {tool.pageDescription !== undefined && (
                <>
                  <meta name="description" content={tool.pageDescription} />
                  <meta
                    property="og:description"
                    content={tool.pageDescription}
                  />
                </>
              )}
            </>
          )}
        </>
      )}

      {pathSplit.length === 3 && (
        <div
          style={{
            height: 128,
            boxShadow: `inset 0 -192px 128px -128px red`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              backgroundImage: `url(${imgur(tool!.image, {
                format: 'jpeg',
                size: ImgurSize.HugeThumbnail,
              })})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              zIndex: -1,
              // filter: 'blur(4px)',
              transform: 'scale(calc((128 + 8) / 128))',
            }}
          />

          <Link
            href={`/tools/${toolId}`}
            style={{
              textDecoration: 'none',
              fontWeight: 900,
              color: 'red',
              fontSize: 32,
              letterSpacing: -1,
            }}
          >
            {tool?.title}
          </Link>
          <span
            style={{
              color: 'red',
              fontSize: 16,
            }}
          >
            {tool?.description}
          </span>
        </div>
      )}

      {children}
    </>
  );
}
