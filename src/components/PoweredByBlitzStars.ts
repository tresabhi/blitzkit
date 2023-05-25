export default function PoweredByBlitzStars() {
  return `
    <style>
      .powered-by-blitz-stars {
        display: flex;
        gap: 4px;
        justify-content: flex-end;
      }

      .powered-by-blitz-stars-icon {
        height: 16px;
        width: 16px;
      }

      .powered-by-blitz-stars-text {
        font-size: 16px;
        color: #A0A0A0;
      }
    </style>

    <div class="powered-by-blitz-stars">
      <img class="powered-by-blitz-stars-icon" src="https://www.blitzstars.com/assets/images/4b4cb591.TankyMcPewpew.png" />
      <span class="powered-by-blitz-stars-text">Powered by BlitzStars</span>
    </div>
  `;
}
