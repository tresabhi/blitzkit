import { Grid, type GridProps } from '@radix-ui/themes';

export function TankCardWrapper(props: GridProps) {
  return (
    <Grid
      py="4"
      columns={{
        initial: 'repeat(auto-fill, minmax(6rem, 1fr))',
        sm: 'repeat(auto-fill, minmax(10rem, 1fr))',
      }}
      flow="dense"
      gap="4"
      gapY="8"
      {...props}
    />
  );
}
