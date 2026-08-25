import { useEffect, useRef, useState } from "react";
import { CoverStage } from "./components/CoverStage";
import { EditorPanel } from "./components/EditorPanel";
import { HomePage } from "./components/HomePage";
import { InspectorPanel } from "./components/InspectorPanel";
import { ThumbCapture } from "./components/ThumbCapture";
import { TopBar } from "./components/TopBar";
import { isTemplateId } from "./data/templates";
import { isBuiltinId } from "./lib/document";
import { coverFilename, exportCoverPng } from "./lib/exportCover";
import { displaySubtitle, displayTitle } from "./lib/interpolate";
import { CoverProvider, useCover } from "./store/CoverContext";
import type { TemplateId } from "./types";

type Route =
  | { kind: "home" }
  | { kind: "edit"; templateId: TemplateId }
  | { kind: "thumb"; templateId: TemplateId };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, "");
  const thumb = hash.match(/^\/__thumb\/([\w-]+)/)?.[1];
  if (thumb && isBuiltinId(thumb)) return { kind: "thumb", templateId: thumb };
  const id = hash.match(/^\/t\/([\w-]+)/)?.[1];
  if (id && isTemplateId(id)) return { kind: "edit", templateId: id };
  return { kind: "home" };
}

function useTemplateRoute() {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const sync = () => setRoute(parseHash());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return {
    route,
    openHome: () => {
      window.location.hash = "#/";
    },
    openTemplate: (id: string) => {
      window.location.hash = `#/t/${id}`;
    },
  };
}

function Workbench({ onBack, onOpen }: { onBack: () => void; onOpen: (id: string) => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const { templateName, draft, titleKind } = useCover();
  const title = displayTitle(draft, titleKind);
  const subtitle = displaySubtitle(draft);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-ink">
      <TopBar
        onBack={onBack}
        stageRef={stageRef}
        onSavedTemplate={onOpen}
        onExport={async () => {
          if (!stageRef.current) throw new Error("no stage");
          await exportCoverPng(stageRef.current, coverFilename(draft.date, templateName, draft.operatorName));
        }}
      />
      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden p-4">
        <InspectorPanel />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <article className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] bg-panel">
            <div className="relative min-h-0 flex-1 bg-white">
              <div className="absolute inset-0">
                <CoverStage stageRef={stageRef} />
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-3">
              <p className="truncate text-[15px] font-medium text-text">
                {title || "未命名封面"}
                {subtitle ? <span className="ml-2 font-normal text-mute">{subtitle}</span> : null}
              </p>
              <p className="shrink-0 text-[12px] text-mute">1920 × 1080</p>
            </div>
          </article>
          <p className="mt-2 shrink-0 px-1 text-[13px] text-mute">点选图层可拖移、四角缩放；右侧改文案和立绘</p>
        </main>
        <EditorPanel />
      </div>
    </div>
  );
}

export default function App() {
  const { route, openHome, openTemplate } = useTemplateRoute();

  if (route.kind === "home") {
    return <HomePage onOpen={openTemplate} />;
  }

  if (route.kind === "thumb") {
    return <ThumbCapture templateId={route.templateId} />;
  }

  return (
    <CoverProvider key={route.templateId} templateId={route.templateId}>
      <Workbench onBack={openHome} onOpen={openTemplate} />
    </CoverProvider>
  );
}
