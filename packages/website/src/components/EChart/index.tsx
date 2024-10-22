import { Box, Flex, Heading, type BoxProps } from '@radix-ui/themes';
import type { ECharts, EChartsOption, SetOptionOpts } from 'echarts';
import { getInstanceByDom, init } from 'echarts';
import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';
import { echartsTheme } from './theme';

export type EChartProps = BoxProps & {
  option: EChartsOption;
  style?: CSSProperties;
  settings?: SetOptionOpts;
};

/**
 * Thank you Maneet Goyal! Heavily modified.
 *
 * https://dev.to/manufac/using-apache-echarts-with-react-and-typescript-353k
 */
export function EChart({
  option,
  settings,
  title,
  ...props
}: EChartProps): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chart
    let chart: ECharts | undefined;
    if (chartRef.current !== null) {
      chart = init(chartRef.current, echartsTheme, { renderer: 'svg' });
    }

    // Add chart resize listener
    // ResizeObserver is leading to a bit janky UX
    function resizeChart() {
      chart?.resize();
    }
    window.addEventListener('resize', resizeChart);

    // Return cleanup function
    return () => {
      chart?.dispose();
      window.removeEventListener('resize', resizeChart);
    };
  }, []);

  useEffect(() => {
    if (chartRef.current === null) return undefined;

    const chart = getInstanceByDom(chartRef.current);

    if (chart === undefined) return undefined;

    chart.setOption(option, settings);
  }, [option, settings]);

  return (
    <Flex direction="column" align="center">
      {title && <Heading align="center">{title}</Heading>}
      <Box {...props} ref={chartRef} width="100%" />
    </Flex>
  );
}
