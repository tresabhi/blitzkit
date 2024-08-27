import { CaretRightIcon } from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Flex,
  FlexProps,
  Heading,
  Link,
  Text,
} from '@radix-ui/themes';
import { Tool } from '../../constants/tools';
import { ImgurSize, imgur } from '../../core/blitzkit/imgur';

type ToolCardProps = FlexProps & {
  tool: Tool;
};

export function ToolCard({ tool, style, ...props }: ToolCardProps) {
  const size = tool.significant
    ? ImgurSize.HugeThumbnail
    : ImgurSize.LargeThumbnail;

  return (
    <Flex
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-2)',
        overflow: 'hidden',
        backgroundImage: `url(${imgur(tool.image, { format: 'jpeg', size })})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: tool.significant ? 'min(320px, 50vh)' : '256px',
        ...style,
      }}
      flexGrow={tool.significant ? undefined : '1'}
      flexBasis={
        tool.significant
          ? undefined
          : {
              initial: undefined,
              sm: '0',
            }
      }
      {...props}
    >
      <Link
        href={tool.href ?? `/tools/${tool.id}`}
        target={tool.href ? '_blank' : undefined}
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <Box
          flexGrow="1"
          style={{
            backgroundImage: `url(${imgur(tool.image, { format: 'jpeg', size })})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <Flex
          px={{
            initial: '6',
            md: tool.significant ? '8' : '6',
          }}
          py={{
            initial: '4',
            sm: tool.significant ? '6' : '4',
          }}
          gap="4"
          align="center"
          justify="between"
          width="100%"
          direction={{
            initial: 'column',
            xs: 'row',
          }}
          style={{
            backgroundColor: 'var(--color-panel-translucent)',
            backdropFilter: 'blur(64px)',
            WebkitBackdropFilter: 'blur(64px)',
          }}
        >
          <Flex
            direction="column"
            justify="center"
            align={{
              initial: 'center',
              xs: 'start',
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
}
