import { times } from 'lodash';
import { theme } from '../../../stitches.config.js';
import { MarginInputProps } from './Root.js';

export enum MarginOrientation {
  Vertical,
  Horizontal,
}

export interface MarginProps extends MarginInputProps {
  verticalSeparations: number;
  orientation?: MarginOrientation;
}

export function Margin({
  verticalSeparations,
  max,
  min,
  suffix,
  precision = 0,
  orientation = MarginOrientation.Vertical,
}: MarginProps) {
  const isVertical = orientation === MarginOrientation.Vertical;

  return (
    <div
      style={{
        paddingLeft: isVertical ? 0 : 64,
        width: isVertical ? 48 : '100%',
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row-reverse',
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
          ).toFixed(precision)}${suffix ?? ''}`}
        </span>
      ))}
    </div>
  );
}
