import { theme } from '../stitches.config.js';

export default function NoBattlesInPeriod() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: 16, color: theme.colors.textLowContrast }}>
        No battles played in this period
      </span>
    </div>
  );
}
