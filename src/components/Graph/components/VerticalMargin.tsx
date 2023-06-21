import { times } from 'lodash';
import { theme } from '../../../stitches.config.js';
import { MarginProps } from './Root.js';

export enum VerticalMarginAlign {
  Left,
  Right,
}

export interface VerticalMarginProps extends MarginProps {
  verticalSeparations: number;
  align?: VerticalMarginAlign;
}

export function VerticalMargin({
  verticalSeparations,
  max,
  min,
  suffix,
  align = VerticalMarginAlign.Left,
}: VerticalMarginProps) {
  return (
    <div
      style={{
        width: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems:
          align === VerticalMarginAlign.Right ? 'flex-end' : 'flex-start',
        justifyContent: 'space-between',
      }}
    >
      {times(verticalSeparations, (index) => (
        <span
          key={index}
          style={{
            fontSize: 16,
            color: theme.colors.textLowContrast,
          }}
        >
          {`${(
            (max - min) *
              ((verticalSeparations - (index + 1)) /
                (verticalSeparations - 1)) +
            min
          ).toFixed(0)}${suffix ?? ''}`}
        </span>
      ))}
    </div>
  );
}
