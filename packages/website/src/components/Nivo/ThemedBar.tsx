import {
  ResponsiveBar,
  type BarDatum,
  type ResponsiveBarSvgProps,
} from '@nivo/bar';
import { nivoTheme } from '../../core/nivo/theme';

export function ThemedBar<RawDatum extends BarDatum>(
  props: ResponsiveBarSvgProps<RawDatum>,
) {
  return (
    <ResponsiveBar
      colors={{ scheme: 'yellow_green_blue' }}
      theme={nivoTheme}
      borderRadius={4}
      {...props}
    />
  );
}
