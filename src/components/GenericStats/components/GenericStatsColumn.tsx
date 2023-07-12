import { Stat } from '..';
import GenericStatsRow from './GenericStatsRow';

export interface GenericStatsColumnProps {
  stats: Stat[];
}

export default function GenericStatsColumn({ stats }: GenericStatsColumnProps) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {stats.map((stat) => (
        <GenericStatsRow key={stat[0]} stat={stat} />
      ))}
    </div>
  );
}
