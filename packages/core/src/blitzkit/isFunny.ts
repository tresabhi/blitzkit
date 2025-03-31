const FUNNY_DATES: [number, number][] = [
  [4, 1],
  [4, 2],
  [4, 3],
];

export function isFunny() {
  return true;

  const now = new Date();

  return (
    FUNNY_DATES.some(
      ([month, day]) => now.getMonth() === month - 1 && now.getDate() === day,
    ) || import.meta.env.DEBUG_FUNNY === 'true'
  );
}
