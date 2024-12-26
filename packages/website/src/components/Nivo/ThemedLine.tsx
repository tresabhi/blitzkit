import { ResponsiveLine, type LineSvgProps } from '@nivo/line';
import { nivoTheme } from '../../core/nivo/theme';

export function ThemedLine(props: LineSvgProps) {
  return (
    <ResponsiveLine
      colors={{ scheme: 'yellow_green_blue' }}
      theme={nivoTheme}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      enablePoints={true}
      useMesh
      {...props}
    />
  );
}
