import { PeriodStatistics } from '../types/statistics.js';
import { tankAverages } from './tankAverages.js';

// const expDmg = 2300;
// const expSpot = 1;
// const expFrag = 0.5;
// const expDef = 5;
// const expWinRate = 48;

const expDmg =
  tankAverages.reduce((a, b) => a + b.special.damagePerBattle, 0) / tankAverages.length;
const expSpot =
  tankAverages.reduce((a, b) => a + (b.all.spotted / b.all.battles), 0) / tankAverages.length;
const expFrag =
  tankAverages.reduce((a, b) => a + b.special.killsPerBattle, 0) / tankAverages.length;
const expDef =
  tankAverages.reduce((a, b) => a + b.all.capture_points / b.all.battles, 0) /
  tankAverages.length;
const expWinRate =
  tankAverages.reduce((a, b) => a + b.special.winrate, 0) / tankAverages.length;

export default function wn8(stats: PeriodStatistics) {
  const rDAMAGE = stats.special.dpb / expDmg;

  const rDAMAGEc = Math.max(0, (rDAMAGE - 0.22) / (1 - 0.22));

  const rSPOT = stats.special.spb / expSpot;
  const rFRAG = stats.special.kpb / expFrag;
  const rDEF = stats.all.capture_points / stats.all.battles / expDef;
  const rWIN = stats.special.winrate / expWinRate;

  const rFRAGc = Math.max(
    0,
    Math.min(rDAMAGEc + 0.2, (rFRAG - 0.12) / (1 - 0.12)),
  );
  const rSPOTc = Math.max(
    0,
    Math.min(rDAMAGEc + 0.1, (rSPOT - 0.38) / (1 - 0.38)),
  );
  const rDEFc = Math.max(0, Math.min(rDAMAGEc + 0.1, (rDEF - 0.1) / (1 - 0.1)));

  let rWINc =
    0.09 +
    0.613 * rDAMAGEc +
    0.131 * rFRAGc * rDAMAGEc +
    0.097 * rFRAGc * rSPOTc +
    0.047 * rFRAGc * rDEFc;

  rWINc = Math.max(0, (rWIN - 0.71) / (1 - 0.71));

  const WN8 =
    980 * rDAMAGEc +
    210 * rDAMAGEc * rFRAGc +
    155 * rFRAGc * rSPOTc +
    75 * rDEFc * rFRAGc +
    145 * Math.min(1.8, rWINc);

  return WN8;
}
