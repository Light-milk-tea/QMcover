import mark from "../assets/brand-mark.png";

type Props = {
  className?: string;
};

export function BrandMark({ className = "" }: Props) {
  return (
    <img
      src={mark}
      alt=""
      width={32}
      height={32}
      draggable={false}
      className={`size-8 shrink-0 rounded-[8px] object-cover ${className}`.trim()}
    />
  );
}
