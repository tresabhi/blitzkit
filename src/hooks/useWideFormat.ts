export function useWideFormat() {
  const wideFormat = typeof window !== 'undefined' && window.innerWidth > 880;
  return wideFormat;
}
