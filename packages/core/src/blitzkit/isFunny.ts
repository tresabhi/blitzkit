const FUNNY_DATES: [number, number][] = [
  // two days for april fools
  [4, 1],
  [4, 2],
];

export function isFunny() {
  const now = new Date();

  return (
    FUNNY_DATES.some(
      ([month, day]) => now.getMonth() === month - 1 && now.getDate() === day,
    ) || import.meta.env.DEBUG_FUNNY === 'true'
  );
}
