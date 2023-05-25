export default function NoBattlesInPeriod() {
  return `
    <style>
      .no-battles-in-period {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .no-battles-in-period-text {
        font-size: 16px;
        color: #A0A0A0;
      }
    </style>

    <div class="no-battles-in-period">
      <span class="no-battles-in-period-text">No battles played in this period</span>
    </div>
  `;
}
