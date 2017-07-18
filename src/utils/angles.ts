export function fraction(a: number, b: number, fraction: number = 0.5) {
  return a + to180(b - a) * fraction;
}

export function to180(angle: number): number {
  angle = to360(angle);
  if (angle > 180)
    angle -= 360;

  return angle;
}

export function to360(angle: number): number {
  angle = angle % 360;
  if (angle < 0)
    angle += 360;
  return angle;
}
