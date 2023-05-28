import GenericStatsColumn from './components/GenericStatsColumn.js';

export type Stat = [string, string | number];

export interface GenericStatsProps {
  stats: Stat[];
  columnCount?: number;
}

export default function GenericStats({
  stats,
  columnCount = 2,
}: GenericStatsProps) {
  const itemsPerRow = Math.ceil(stats.length / columnCount);
  const columns: Stat[][] = [];

  stats.forEach((stat, index) => {
    const column = Math.floor(index / itemsPerRow);
    if (!columns[column]) columns[column] = [];
    columns[column].push(stat);
  });

  return (
    <div style={{ display: 'flex', gap: 32 }}>
      {columns.map((stats) => (
        <GenericStatsColumn
          key={stats.map((stat) => stat[0]).join('-')}
          stats={stats}
        />
      ))}
    </div>
  );
}
