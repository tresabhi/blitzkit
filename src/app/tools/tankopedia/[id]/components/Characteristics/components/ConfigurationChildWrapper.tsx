import { Flex } from '@radix-ui/themes';
import { ReactNode } from 'react';

interface ConfigurationChildWrapperProps {
  children: ReactNode;
}

export function ConfigurationChildWrapper({
  children,
}: ConfigurationChildWrapperProps) {
  return (
    <Flex gap="2" direction="column">
      {children}
    </Flex>
  );
}
