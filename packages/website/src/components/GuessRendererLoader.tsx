import { Box, Spinner } from '@radix-ui/themes';

export function GuessRendererLoader() {
  return (
    <Box
      position="absolute"
      top="50%"
      left="50%"
      style={{ transform: 'translate(-50%, -50%)' }}
    >
      <Spinner size="3" />
    </Box>
  );
}
