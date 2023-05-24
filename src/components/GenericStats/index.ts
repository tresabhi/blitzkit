import GenericStatsColumn from './components/GenericStatsColumn.js';

export type Stat = [string, string | number];

export default function GenericStats(stats: Stat[], columnCount = 2) {
  const itemsPerRow = Math.ceil(stats.length / columnCount);
  const columns: Stat[][] = [];

  stats.forEach((stat, index) => {
    const column = Math.floor(index / itemsPerRow);
    if (!columns[column]) columns[column] = [];
    columns[column].push(stat);
  });

  return `
    <style>
      .generic-stats {
        display: flex;
        gap: 32px;
      }
    </style>

    <div class="generic-stats">
      ${columns.map((column) => GenericStatsColumn(column)).join('\n')}
    </div>
  `;
}
