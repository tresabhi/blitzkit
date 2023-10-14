import { AllStats } from '../blitz/getAccountInfo';

/**
 * Formula from https://web.archive.org/web/20190105064817/http://wiki.wnefficiency.net/pages/WN8
 *
 * @param expected what all players on average perform like
 * @param average what the player in question performs like
 */
export default function calculateWN8(expected: AllStats, average: AllStats) {
  const avgDmg = average.damage_dealt / average.battles;
  const avgSpot = average.spotted / average.battles;
  const avgFrag = average.frags / average.battles;
  const avgDef = average.dropped_capture_points / average.battles;
  const avgWinRate = average.wins / average.battles;

  const expDmg = expected.damage_dealt / expected.battles;
  const expSpot = expected.spotted / expected.battles;
  const expFrag = expected.frags / expected.battles;
  const expDef = expected.dropped_capture_points / expected.battles;
  const expWinRate = expected.wins / expected.battles;

  const rDAMAGE = avgDmg / expDmg;
  const rSPOT = avgSpot / expSpot;
  const rFRAG = avgFrag / expFrag;
  const rDEF = avgDef / expDef;
  const rWIN = avgWinRate / expWinRate;

  const rWINc = Math.max(0, (rWIN - 0.71) / (1 - 0.71));
  const rDAMAGEc = Math.max(0, (rDAMAGE - 0.22) / (1 - 0.22));
  const rFRAGc = Math.max(
    0,
    Math.min(rDAMAGEc + 0.2, (rFRAG - 0.12) / (1 - 0.12)),
  );
  const rSPOTc = Math.max(
    0,
    Math.min(rDAMAGEc + 0.1, (rSPOT - 0.38) / (1 - 0.38)),
  );
  const rDEFc = Math.max(0, Math.min(rDAMAGEc + 0.1, (rDEF - 0.1) / (1 - 0.1)));

  const WN8 =
    980 * rDAMAGEc +
    210 * rDAMAGEc * rFRAGc +
    155 * rFRAGc * rSPOTc +
    75 * rDEFc * rFRAGc +
    145 * Math.min(1.8, rWINc);

  return WN8;
}
