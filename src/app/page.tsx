import { CaretRightIcon } from '@radix-ui/react-icons';
import { Button, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import PageWrapper from '../components/PageWrapper';
import { TOOLS } from '../constants/tools';
import { imgur } from '../core/blitzkit/imgur';

export default function Page() {
  return (
    <>
      <PageWrapper size={1028}>
        <Grid
          p="4"
          gap="4"
          columns={{
            initial: undefined,
            sm: '2',
          }}
          flow="row-dense"
        >
          {TOOLS.map((tool) => {
            return (
              <Flex
                key={tool.id}
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-2)',
                  overflow: 'hidden',
                  backgroundImage: `url(${imgur(tool.image)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: tool.significant ? 'min(320px, 50vh)' : '256px',
                }}
                gridColumn={{
                  initial: undefined,
                  sm: tool.significant ? '1 / 3' : undefined,
                }}
              >
                <Link
                  href={tool.href ?? `/tools/${tool.id}`}
                  style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    alignItems: 'end',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <Flex
                    px={{
                      initial: '6',
                      md: tool.significant ? '8' : '6',
                    }}
                    py={tool.significant ? '6' : '4'}
                    gap="4"
                    align="center"
                    justify="between"
                    width="100%"
                    direction={{
                      initial: 'column',
                      sm: 'row',
                    }}
                    style={{
                      backgroundColor: 'var(--color-panel-translucent)',
                      backdropFilter: 'blur(16px)',
                    }}
                  >
                    <Flex
                      direction="column"
                      justify="center"
                      align={{
                        initial: 'center',
                        sm: 'start',
                      }}
                    >
                      <Heading
                        align={{
                          initial: 'center',
                          sm: 'left',
                        }}
                        size={{
                          initial: '6',
                          sm: tool.significant ? '7' : '5',
                        }}
                        weight="medium"
                      >
                        {tool.title}
                      </Heading>
                      <Text
                        align={{
                          initial: 'center',
                          sm: 'left',
                        }}
                        size={{
                          initial: '3',
                          sm: tool.significant ? '4' : '3',
                        }}
                        color="gray"
                      >
                        {tool.description}
                      </Text>
                    </Flex>

                    <Button
                      size={{
                        initial: undefined,
                        sm: tool.significant ? '3' : undefined,
                      }}
                      color={tool.button.color}
                      style={{
                        cursor: 'inherit',
                      }}
                    >
                      {tool.button.text}
                      <CaretRightIcon />
                    </Button>
                  </Flex>
                </Link>
              </Flex>
            );
          })}
        </Grid>
      </PageWrapper>

      <div style={{ flex: 1 }} />
    </>
  );
}
