import { theme } from '../stitches.config.js';

export enum NoDataType {
  BattlesInPeriod,
  PlayersInPeriod,
  TanksFound,
}

export interface NoDataProps {
  type: NoDataType;
}

const NO_DATA_MESSAGES: Record<NoDataType, string> = {
  [NoDataType.BattlesInPeriod]: 'No battles played in this period',
  [NoDataType.PlayersInPeriod]: 'No players in this period',
  [NoDataType.TanksFound]: 'No tanks found',
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
