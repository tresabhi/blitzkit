import { Flex, Text } from '@radix-ui/themes';
import { theme } from '../../../../../../../stitches.config';

interface InfoProps {
  name: string;
  value: string;
  unit: string;
  indent?: boolean;
}

export function Info({ name, value, unit, indent = false }: InfoProps) {
  return (
    <Flex
      align="center"
      style={{ width: '100%', paddingLeft: indent ? 24 : 0 }}
      gap="4"
    >
      <Text>
        {name}{' '}
        <Text color="gray" size="1">
          {unit}
        </Text>
      </Text>

      <div
        style={{
          flex: 1,
          height: 1,
          backgroundColor: theme.colors.componentCallToActionInteractive_alpha,
        }}
      />

      <Text>{value}</Text>
    </Flex>
  );
}
