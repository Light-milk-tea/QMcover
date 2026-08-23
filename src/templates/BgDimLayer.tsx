type Props = {
  on?: boolean;
  amount?: number;
  at?: string;
  className?: string;
};

export function BgDimLayer({ on = false, amount = 48, at = "40% 46%", className = "" }: Props) {
  const t = Math.min(100, Math.max(0, amount)) / 100;
  if (!on || t <= 0) return null;
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        background: `radial-gradient(ellipse 78% 72% at ${at}, rgba(12,16,22,${0.9 * t}) 0%, rgba(12,16,22,${0.55 * t}) 34%, rgba(12,16,22,${0.18 * t}) 58%, transparent 76%)`,
      }}
    />
  );
}
