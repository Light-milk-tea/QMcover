import type { ReactNode } from "react";

type Props = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, hint, children }: Props) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] text-sub">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[12px] text-mute">{hint}</span> : null}
    </label>
  );
}

export const fieldClass =
  "w-full rounded-[6px] border border-line bg-panel px-3 py-1.5 text-[13px] text-text outline-none placeholder:text-mute transition-colors hover:border-[#c9ccd0] focus:border-accent";
