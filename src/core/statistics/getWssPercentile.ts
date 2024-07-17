export enum WssInterpretation {
  SuperMalum,
  Malum,
  Bad,
  BelowAverage,
  Average,
  AboveAverage,
  Good,
  Unicum,
  SuperUnicum,
}

interface WssPercentileEntry {
  minZ: number;
  minPercentile: number;
  interpretation: WssInterpretation;
}

export const WSS_INTERPRETATIONS: WssPercentileEntry[] = [
  {
    minZ: -Infinity,
    minPercentile: 0,
    interpretation: WssInterpretation.SuperMalum,
  },
  {
    minZ: -2.38,
    minPercentile: 0.01,
    interpretation: WssInterpretation.Malum,
  },
  {
    minZ: -1.28,
    minPercentile: 0.1,
    interpretation: WssInterpretation.Bad,
  },
  {
    minZ: -0.83,
    minPercentile: 0.2,
    interpretation: WssInterpretation.BelowAverage,
  },
  {
    minZ: -0.23,
    minPercentile: 0.4,
    interpretation: WssInterpretation.Average,
  },
  {
    minZ: 0.23,
    minPercentile: 0.6,
    interpretation: WssInterpretation.AboveAverage,
  },
  {
    minZ: 0.83,
    minPercentile: 0.8,
    interpretation: WssInterpretation.Good,
  },
  {
    minZ: 1.25,
    minPercentile: 0.9,
    interpretation: WssInterpretation.Unicum,
  },
  {
    minZ: 2.38,
    minPercentile: 0.99,
    interpretation: WssInterpretation.SuperUnicum,
  },
];

export const WSS_COLORS = {
  [WssInterpretation.SuperMalum]: 'tomato',
  [WssInterpretation.Malum]: 'orange',
  [WssInterpretation.Bad]: 'amber',
  [WssInterpretation.BelowAverage]: 'lime',
  [WssInterpretation.Average]: 'green',
  [WssInterpretation.AboveAverage]: 'teal',
  [WssInterpretation.Good]: 'cyan',
  [WssInterpretation.Unicum]: 'pink',
  [WssInterpretation.SuperUnicum]: 'purple',
} as const;

export default function getWssInterpretation(wn8: number) {
  const lastIndex = WSS_INTERPRETATIONS.findLastIndex(
    ({ minZ: min }) => min <= wn8,
  );
  return WSS_INTERPRETATIONS[lastIndex].interpretation;
}
