export default function compoundingAverage(
  average1: number,
  battles1: number,
  average2: number,
  battles2: number,
) {
  return (average2 * battles2 - average1 * battles1) / (battles2 - battles1);
}
