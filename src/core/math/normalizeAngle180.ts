export function normalizeAngle180(angle: number) {
  const newAngle = angle % (2 * Math.PI);

  if (newAngle > Math.PI) {
    return newAngle - 2 * Math.PI;
  }
  if (newAngle < -Math.PI) {
    return newAngle + 2 * Math.PI;
  }

  return newAngle;
}
