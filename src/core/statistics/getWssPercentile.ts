export enum WssInterpretation {
  SuperMalum,
  Malum,
  VeryBad,
  Bad,
  BelowAverage,
  Average,
  AboveAverage,
  Good,
  VeryGood,
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
    minZ: -2.33,
    minPercentile: 0.01,
    interpretation: WssInterpretation.Malum,
  },
  {
    minZ: -1.28,
    minPercentile: 0.1,
    interpretation: WssInterpretation.VeryBad,
  },
  {
    minZ: -0.83,
    minPercentile: 0.2,
    interpretation: WssInterpretation.Bad,
  },
  {
    minZ: -0.55,
    minPercentile: 0.3,
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
    minZ: 0.53,
    minPercentile: 0.7,
    interpretation: WssInterpretation.Good,
  },
  {
    minZ: 0.83,
    minPercentile: 0.8,
    interpretation: WssInterpretation.VeryGood,
  },
  {
    minZ: 1.23,
    minPercentile: 0.9,
    interpretation: WssInterpretation.Unicum,
  },
  {
    minZ: 2.35,
    minPercentile: 0.99,
    interpretation: WssInterpretation.SuperUnicum,
  },
];

export const WSS_COLORS = {
  [WssInterpretation.SuperMalum]: 'tomato',
  [WssInterpretation.Malum]: 'orange',
  [WssInterpretation.VeryBad]: 'amber',
  [WssInterpretation.Bad]: 'yellow',
  [WssInterpretation.BelowAverage]: 'lime',
  [WssInterpretation.Average]: 'green',
  [WssInterpretation.AboveAverage]: 'teal',
  [WssInterpretation.Good]: 'cyan',
  [WssInterpretation.VeryGood]: 'pink',
  [WssInterpretation.Unicum]: 'plum',
  [WssInterpretation.SuperUnicum]: 'purple',
} as const;

export default function getWssInterpretation(wn8: number) {
  const lastIndex = WSS_INTERPRETATIONS.findLastIndex(
    ({ minZ: min }) => min <= wn8,
  );
  return WSS_INTERPRETATIONS[lastIndex].interpretation;
}
