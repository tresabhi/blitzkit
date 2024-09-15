import { Button, Popover } from '@radix-ui/themes';

export function TestComponent() {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button>Radix UI</Button>
      </Popover.Trigger>

      <Popover.Content>Content</Popover.Content>
    </Popover.Root>
  );
}
