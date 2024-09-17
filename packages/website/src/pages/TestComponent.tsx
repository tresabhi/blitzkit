import { Button, Flex, Popover, Text } from '@radix-ui/themes';
import { BlitzKitTheme } from '../components/BlitzKitTheme';

export function TestComponent() {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button>Radix UI</Button>
      </Popover.Trigger>

      <BlitzKitTheme>
        <Popover.Content>
          <Flex direction="column">
            <Text>I should be in a dark mode popover</Text>
            <Button>And I should be yellow and have full border radius!</Button>
          </Flex>
        </Popover.Content>
      </BlitzKitTheme>
    </Popover.Root>
  );
}
