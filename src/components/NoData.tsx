import { theme } from '../stitches.config.js';

export enum NoDataType {
  Battles,
  Players,
}

export interface NoDataProps {
  type: NoDataType;
}

const NO_DATA_MESSAGES: Record<NoDataType, string> = {
  [NoDataType.Battles]: 'No battles played in this period',
  [NoDataType.Players]: 'No players in this period',
};

export default function NoData({ type }: NoDataProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: 16, color: theme.colors.textLowContrast }}>
        {NO_DATA_MESSAGES[type]}
      </span>
    </div>
  );
}
