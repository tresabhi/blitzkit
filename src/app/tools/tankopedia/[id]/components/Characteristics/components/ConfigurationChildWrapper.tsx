import { Flex } from '@radix-ui/themes';
import { ReactNode } from 'react';

interface ConfigurationChildWrapperProps {
  children: ReactNode;
}

export function ConfigurationChildWrapper({
  children,
}: ConfigurationChildWrapperProps) {
  return (
    <Flex direction="column" gap="2" align="end" style={{ width: '100%' }}>
      {children}
    </Flex>
  );
}
