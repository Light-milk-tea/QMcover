export function normalizeDeg(deg: number): number {
  const n = ((deg % 360) + 360) % 360;
  return n > 180 ? n - 360 : n;
}

export function snapDeg(deg: number, step = 15): number {
  return Math.round(deg / step) * step;
}

export function pointerDegrees(clientX: number, clientY: number, cx: number, cy: number): number {
  return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
}

export function toLocalDelta(dx: number, dy: number, rotation = 0): { dx: number; dy: number } {
  if (!rotation) return { dx, dy };
  const rad = (-rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { dx: dx * cos - dy * sin, dy: dx * sin + dy * cos };
}
