'use client';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Flex, Heading, Text, TextField } from '@radix-ui/themes';
import { NAVBAR_HEIGHT } from '../components/Navbar';
import PageWrapper from '../components/PageWrapper';
import { theme } from '../stitches.config';

export default function Page() {
  return (
    <>
      <Flex
        align="center"
        justify="center"
        style={{
          height: `calc(75vh - ${NAVBAR_HEIGHT}px)`,
          position: 'relative',
        }}
        p="4"
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url(https://i.imgur.com/qfFQvyl.png)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(${theme.colors.appBackground1}c0, ${theme.colors.appBackground1}ff)`,
          }}
        />

        <Flex
          direction="column"
          gap="4"
          align="center"
          justify="center"
          style={{ position: 'relative', width: '100%' }}
        >
          <Flex direction="column" align="center">
            <Heading size="9" weight="bold" align="center">
              BlitzKit
            </Heading>
            <Text color="gray" align="center">
              Everything World of Tanks Blitz
            </Text>
          </Flex>

          <TextField.Root
            size="3"
            placeholder="Search players or tanks..."
            style={{
              width: 352,
              maxWidth: '100%',
            }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>
        </Flex>
      </Flex>

      <PageWrapper noFlex1>
        hello there! ignore my existence pretty please :&#41;
      </PageWrapper>

      <div style={{ flex: 1 }} />
    </>
  );
}
