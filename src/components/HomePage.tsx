import { TEMPLATES } from "../data/templates";
import { templateThumbSrc } from "../lib/thumbs";

type Props = {
  onOpen: (id: string) => void;
};

export function HomePage({ onOpen }: Props) {
  return (
    <div className="min-h-[100dvh] bg-ink">
      <header className="flex h-16 items-center justify-between border-b border-line bg-panel px-6">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[8px] bg-accent text-[11px] font-bold text-white">
            QM
          </span>
          <span className="text-[16px] font-medium text-text">封面工坊</span>
        </div>
        <p className="text-[13px] text-mute">B 站 1920 × 1080</p>
      </header>

      <main className="mx-auto max-w-[1280px] px-6 py-8">
        <h1 className="text-[22px] font-medium text-text">选择模板</h1>
        <p className="mt-1 text-[14px] text-mute">点一张开始做封面</p>

        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onOpen(item.id)}
                className="group w-full overflow-hidden rounded-[8px] bg-panel text-left"
              >
                <img
                  key={templateThumbSrc(item.id)}
                  src={templateThumbSrc(item.id)}
                  alt=""
                  width={960}
                  height={540}
                  decoding="async"
                  fetchPriority={item.id === "firstkill" ? "high" : "low"}
                  className="aspect-video w-full bg-[#0c0d0e] object-cover"
                />
                <div className="px-4 py-3">
                  <p className="text-[15px] font-medium text-text group-hover:text-accent">{item.name}</p>
                  <p className="mt-0.5 text-[13px] text-mute">{item.blurb}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
