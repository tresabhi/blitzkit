import { Stat } from '../index.js';

export interface GenericStatsRowProps {
  stat: Stat;
}

export default function GenericStatsRow({ stat }: GenericStatsRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span style={{ color: '#A0A0A0', fontSize: 16 }}>{stat[0]}</span>
      <span style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
        {stat[1]}
      </span>
    </div>
  );
}
