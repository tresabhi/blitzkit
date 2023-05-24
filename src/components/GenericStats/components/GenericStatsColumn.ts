import { Stat } from '../index.js';
import GenericStatsRow from './GenericStatsRow.js';

export default function GenericStatsColumn(stats: Stat[]) {
  return `
    <style>
      .generic-stats-column {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    </style>

    <div class="generic-stats-column">
      ${stats.map((stat) => GenericStatsRow(stat)).join('\n')}
    </div>
  `;
}
