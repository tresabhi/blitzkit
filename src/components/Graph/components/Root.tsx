import { times } from 'lodash';
import { ReactNode } from 'react';
import { theme } from '../../../stitches.config';
import { Margin, MarginOrientation } from './Margin';

export const GRAPH_WIDTH = 544;
export const GRAPH_HEIGHT = 320;

export interface MarginInputProps {
  min: number;
  max: number;
  suffix?: string;
  precision?: number;
}

export interface RootProps {
  children: ReactNode;
  verticalMargin?: MarginInputProps;
  horizontalMargin?: MarginInputProps;
  separations?: number;
  xMinLabel: string;
  xMaxLabel: string;
  xTitle: string;
}

export function Root({
  children,
  verticalMargin,
  horizontalMargin,
  separations = 5,
  xMinLabel,
  xMaxLabel,
  xTitle,
}: RootProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          paddingLeft: 64,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 16, color: theme.colors.textHighContrast }}>
          {xMinLabel}
        </span>
        <span style={{ fontSize: 16, color: theme.colors.textHighContrast }}>
          {xMaxLabel}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {verticalMargin && (
          <Margin {...verticalMargin} verticalSeparations={separations} />
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
          {times(separations - 2, (index) => {
            const y = GRAPH_HEIGHT * ((index + 1) / (separations - 1));

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
      </div>

      {horizontalMargin && (
        <Margin
          {...horizontalMargin}
          verticalSeparations={separations}
          orientation={MarginOrientation.Horizontal}
        />
      )}

      <div
        style={{
          paddingLeft: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 16, color: theme.colors.textLowContrast }}>
          {xTitle}
        </span>
      </div>
    </div>
  );
}
