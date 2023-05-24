import { Stat } from '../index.js';

export default function GenericStatsRow(stat: Stat) {
  return `
    <style>
      .generic-stats-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .generic-stats-label {
        color: #A0A0A0;
        font-size: 16px;
      }

      .generic-stats-value {
        color: white;
        font-weight: bold;
        font-size: 16px;
      }
    </style>

    <div class="generic-stats-row">
      <span class="generic-stats-label">${stat[0]}</span>
      <span class="generic-stats-value">${stat[1]}</span>
    </div>
  `;
}
