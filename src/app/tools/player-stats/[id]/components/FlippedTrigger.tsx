import { Tabs, Text } from '@radix-ui/themes';
import { TriggerProps } from '@radix-ui/themes/dist/cjs/components/tabs';

export function FlippedTrigger({ children, ...props }: TriggerProps) {
  return (
    <Tabs.Trigger {...props}>
      <Text
        style={{
          transform: 'scaleY(-1)',
        }}
      >
        {children}
      </Text>
    </Tabs.Trigger>
  );
}
