import Children from './Children.js';

const Breakdown = {
  Root(...children: string[]) {
    return `
      <style>
        .breakdown {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
      </style>

      <div class="breakdown">
        ${Children(children)}
      </div>
    `;
  },

  Row(
    name: string,
    winrate: number,
    careerWinrate: number,
    wn8: number,
    careerWn8: number,
    averageDamage: number,
    careerAverageDamage: number,
    survival: number,
    careerSurvival: number,
    battles: number,
    careerBattles: number,
    icon?: string,
  ) {
    return `
      <style>
        .breakdown-row {
          display: flex;
          gap: 16px;
        }
      </style>

      <div class="breakdown-row">
        ${this.RowDiscriminator(name, icon)}
        ${this.RowStat(
          'Winrate',
          `${(winrate * 100).toFixed(2)}%`,
          `${(careerWinrate * 100).toFixed(2)}%`,
          winrate - careerWinrate,
        )}
        ${this.RowStat(
          'Damage',
          averageDamage.toFixed(2),
          careerAverageDamage.toFixed(2),
          averageDamage - careerAverageDamage,
        )}
        ${this.RowStat(
          'Survival',
          `${(survival * 100).toFixed(2)}%`,
          `${(careerSurvival * 100).toFixed(2)}%`,
          survival - careerSurvival,
        )}
        ${this.RowStat('Battles', battles.toFixed(0), careerBattles.toFixed(0))}
      </div>
    `;

    /*
    ${this.RowStat(
          'WN8',
          wn8.toFixed(0),
          careerWn8.toFixed(0),
          wn8 - careerWn8,
        )}
        */
  },

  RowDiscriminator(name: string, icon?: string) {
    return `
      <style>
        .breakdown-row-discriminator {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
          width: 0px;
          align-items: center;
          justify-content: center;
        }

        .breakdown-row-discriminator-icon {
          width: 100%;
          flex: 1;
          object-fit: cover;
        }

        .breakdown-row-discriminator-name {
          color: #A0A0A0;
          font-size: 16px;
          text-align: center;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
      </style>

      <div class="breakdown-row-discriminator">
        ${
          icon
            ? `<img src="${icon}" class="breakdown-row-discriminator-icon" />`
            : ''
        }
        <span class="breakdown-row-discriminator-name">${name}</span>
      </div>
    `;
  },

  RowStat(name: string, value: string, career: string, delta?: number) {
    return `
      <style>
        .breakdown-row-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
          justify-content: center;
          flex: 1;
        }

        .breakdown-row-stat-career {
          color: #A0A0A0;
          font-size: 12px;
        }

        .breakdown-row-stat-name {
          color: #A0A0A0;
          font-size: 16px;
        }

        .breakdown-row-stat-value {
          display: flex;
          gap: 4px;
          align-items: center;
          justify-content: center;
        }

        .breakdown-row-stat-value-delta {
          width: 12px;
          height: 12px;
        }

        .breakdown-row-stat-value-text {
          color: white;
          font-size: 16px;
          font-weight: bold;
        }
      </style>

      <div class="breakdown-row-stat">
        <span class="breakdown-row-stat-career">${career}</span>

        <div class="breakdown-row-stat-value">
          ${
            delta
              ? `<img src="${
                  (delta ?? 0) > 0
                    ? 'https://i.imgur.com/qbjiXa1.png'
                    : 'https://i.imgur.com/3uyNhun.png'
                }" class="breakdown-row-stat-value-delta" />`
              : ''
          }

          <span class="breakdown-row-stat-value-text">${value}</span>
        </div>

        <span class="breakdown-row-stat-name">${name}</span>
      </div>
    `;
  },
};

export default Breakdown;
