'use client';

import { CaretRightIcon } from '@radix-ui/react-icons';
import { Button, Flex, Link as LinkRadix } from '@radix-ui/themes';
import Link from 'next/link';
import PageWrapper from '../components/PageWrapper';
import { TOOLS } from '../constants/tools';
import { PatreonIcon } from '../icons/Patreon';
import { theme } from '../stitches.config';
import * as styles from './page.css';

export default function Page() {
  return (
    <PageWrapper>
      <Flex
        direction="column"
        gap="5"
        justify="center"
        align="center"
        style={{ flex: 1 }}
      >
        <LinkRadix href="https://www.patreon.com/tresabhi" target="_blank">
          <Button
            color="ruby"
            style={{
              boxShadow: `0 0 8px ${theme.colors.solidBackground_ruby}f0`,
            }}
          >
            <PatreonIcon style={{ width: '1em', height: '1em' }} /> Consider
            donating on Patreon
          </Button>
        </LinkRadix>

        <Flex gap="3" wrap="wrap" align="center" justify="center">
          {TOOLS.map((tool) => (
            <Link
              href={tool.href ?? `/tools/${tool.id}`}
              target={tool.href ? '_blank' : undefined}
              className={
                tool.disabled ? styles.tool.disabled : styles.tool.enabled
              }
              style={{
                backgroundImage: `url(/assets/banners/${tool.id}.webp)`,
                cursor: tool.disabled ? 'default' : 'pointer',
                opacity: tool.disabled ? 0.25 : 1,
                height: 128,
                minWidth: 256,
                flex: 1,
                borderRadius: 8,
                textDecoration: 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                padding: 16,
                transition: `box-shadow ${theme.durations.regular}`,
              }}
              onClick={(event) => {
                if (tool.disabled) event.preventDefault();
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  color: theme.colors.textHighContrast,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {tool.title}
                <CaretRightIcon style={{ width: '1em', height: '1em' }} />
              </span>
              <span
                style={{
                  color: theme.colors.textLowContrast,
                  fontSize: 16,
                }}
              >
                {tool.disabled ? 'Coming soon!' : tool.description}
              </span>
            </Link>
          ))}
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
