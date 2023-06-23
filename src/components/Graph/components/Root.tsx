import { times } from 'lodash';
import { ReactNode } from 'react';
import { theme } from '../../../stitches.config.js';
import { VerticalMargin, VerticalMarginAlign } from './VerticalMargin.js';

export const GRAPH_WIDTH = 512;
export const GRAPH_HEIGHT = 320;

export interface MarginProps {
  min: number;
  max: number;
  suffix?: string;
}

export interface RootProps {
  children: ReactNode;
  leftVerticalMargin?: MarginProps;
  rightVerticalMargin?: MarginProps;
  verticalSeparations?: number;
  xMinLabel: string;
  xMaxLabel: string;
}

export function Root({
  children,
  leftVerticalMargin,
  rightVerticalMargin,
  verticalSeparations = 5,
  xMinLabel,
  xMaxLabel,
}: RootProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {leftVerticalMargin && (
          <VerticalMargin
            {...leftVerticalMargin}
            verticalSeparations={verticalSeparations}
          />
        )}

        <svg
          viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          preserveAspectRatio="none"
          style={{
            flex: 1,
            backgroundColor: theme.colors.appBackground2,
            borderRadius: 4,
            border: theme.borderStyles.nonInteractive,
          }}
        >
          {times(verticalSeparations - 2, (index) => {
            const y = GRAPH_HEIGHT * ((index + 1) / (verticalSeparations - 1));

            return (
              <polyline
                key={index}
                vector-effect="non-scaling-stroke"
                fill="none"
                stroke={theme.colors.borderNonInteractive}
                stroke-width="2"
                points={`0,${y}, ${GRAPH_WIDTH},${y}`}
              />
            );
          })}

          {children}
        </svg>

        {rightVerticalMargin && (
          <VerticalMargin
            {...rightVerticalMargin}
            verticalSeparations={verticalSeparations}
            align={VerticalMarginAlign.Right}
          />
        )}
      </div>

      <div
        style={{
          paddingLeft: 48,
          paddingRight: 48,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 16, color: theme.colors.textLowContrast }}>
          {xMinLabel}
        </span>
        <span style={{ fontSize: 16, color: theme.colors.textLowContrast }}>
          {xMaxLabel}
        </span>
      </div>
    </div>
  );
}
