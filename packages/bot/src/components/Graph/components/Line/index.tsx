import { blue, green, red, slateDark } from '@radix-ui/colors';
import { GRAPH_HEIGHT, GRAPH_WIDTH } from '../Root/constants';
import { LineColor, LineStyle } from './constants';

const LINE_COLORS = {
  [LineColor.Red]: red.red9,
  [LineColor.Green]: green.green9,
  [LineColor.Blue]: blue.blue9,
  [LineColor.White]: slateDark.slate11,
};

const LINE_STYLES = {
  [LineStyle.Solid]: undefined,
  [LineStyle.Dashes]: '8, 8',
  [LineStyle.DashesAndDots]: '1, 4, 8, 4',
};

export type PlotItem = [number, number];
type Plot = PlotItem[];

interface LineProps {
  plot: Plot;
  minY?: number;
  maxY?: number;
  color?: LineColor;
  style?: LineStyle;
  lineWidth?: number;
}

export function Line({
  plot,
  minY: providedMinY,
  maxY: providedMaxY,
  color = LineColor.Red,
  style = LineStyle.Solid,
  lineWidth = 2,
}: LineProps) {
  const xs = plot.map(([x]) => x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const ys = plot.map(([, y]) => y);
  const minY = providedMinY ?? Math.min(...ys);
  const maxY = providedMaxY ?? Math.max(...ys);
  const rangeX = maxX - minX;
  const rangeY = maxY - minY;
  const points = plot
    .map(
      ([x, y]) =>
        `${(x - minX) * (GRAPH_WIDTH / rangeX)},${
          GRAPH_HEIGHT - (y - minY) * (GRAPH_HEIGHT / rangeY)
        }`,
    )
    .join(' ');

  return (
    <polyline
      vector-effect="non-scaling-stroke"
      fill="none"
      stroke={LINE_COLORS[color]}
      strokeWidth={lineWidth}
      stroke-dasharray={LINE_STYLES[style]}
      points={points}
    />
  );
}
