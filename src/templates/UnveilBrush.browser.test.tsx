import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../index.css";
import { renderBoxChrome, renderTextContent } from "../canvas/LayerChrome";
import { artUrl } from "../data/arts";
import { getDecoration } from "../data/decorations";
import { getTextStyle } from "../data/textStyles";
import { draftToRenderProps } from "../components/CoverStage";
import { EditorPanel } from "../components/EditorPanel";
import { boxLayer, textLayer } from "../lib/document";
import { emptyDraft, loadDraft } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import { CoverView } from "./registry";
import { UnveilBrush } from "./UnveilBrush";

beforeEach(() => {
  localStorage.clear();
});

const stubArt =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e86a4a'/%3E%3C/svg%3E";

function cover({ title = "四术师", subtitle = "H9-6", imageUrl = stubArt } = {}) {
  return (
    <div style={{ width: 1920, height: 1080 }}>
      <UnveilBrush
        title={title}
        subtitle={subtitle}
        signature="LAPPLAND"
        mark={"FOUR\nCASTER OPERATOR"}
        episode={1}
        date="2026-11-27"
        operatorName="荒芜拉普兰德"
        imageUrl={imageUrl}
        imageScale={251}
        imageX={840}
        imageY={126}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="ink"
      />
    </div>
  );
}

const angle = (el: Element) => {
  const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
  return (Math.atan2(m.b, m.a) * 180) / Math.PI;
};

test("红蓝黑卡：关卡码压窄挤出、连字符换红星，中文标题挤出宋体，都斜放在霓虹黑卡上", async () => {
  const screen = await render(cover());
  await document.fonts.load('900 400px "Fraunces Variable"', "H9-6");
  await document.fonts.load('900 150px "Noto Serif SC"', "四术师");
  await document.fonts.ready;
  const root = screen.container;
  const canvas = root.querySelector("[data-unveil-brush]")!.getBoundingClientRect();

  const code = root.querySelector('[data-cover-el="code"]') as HTMLElement;
  expect(getComputedStyle(code).fontFamily).toContain("Fraunces");
  expect(angle(code)).toBeCloseTo(-6, 1);
  const parts = [...code.querySelectorAll("[data-extrude-text]")] as HTMLElement[];
  expect(parts.map((p) => p.lastElementChild!.textContent)).toEqual(["H9", "6"]);
  expect(code.querySelectorAll("[data-code-star]").length).toBe(1);
  const face = parts[0].lastElementChild as HTMLElement;
  expect(getComputedStyle(face).backgroundClip).toBe("text, text");
  expect(getComputedStyle(face).backgroundImage).toContain("radial-gradient");
  expect(getComputedStyle(parts[0].firstElementChild!).color).toBe("rgb(122, 13, 39)");
  // 斑驳蒙版只盖字，右引号在蒙版外，落在大字右侧。
  const grunge = parts[0].closest("[style*='mask']") as HTMLElement;
  expect(getComputedStyle(grunge).maskImage).toContain("data:image/svg+xml");
  const quote = code.querySelector("[data-code-quote]") as HTMLElement;
  expect(grunge.contains(quote)).toBe(false);
  const six = parts[1].getBoundingClientRect();
  expect(quote.getBoundingClientRect().left).toBeGreaterThan(six.right - six.width * 0.2);

  const title = root.querySelector('[data-cover-el="title"]') as HTMLElement;
  expect(title.querySelector("[data-extrude-text]")!.lastElementChild!.textContent).toBe("四术师");
  expect(getComputedStyle(title).fontFamily).toContain("Noto Serif SC");
  // 中文标题压在关卡码上方：标题中线在大字行盒上四分之一以内，底边不过大字中线。
  const t = title.querySelector("[data-extrude-text]")!.lastElementChild!.getBoundingClientRect();
  const h9 = parts[0].lastElementChild!.getBoundingClientRect();
  expect(t.top + t.height / 2).toBeLessThan(h9.top + h9.height * 0.25);
  expect(t.bottom).toBeLessThan(h9.top + h9.height / 2);

  const name = root.querySelector('[data-cover-el="name"]') as HTMLElement;
  expect(name.textContent).toBe("LAPPLAND");
  expect(root.querySelector('[data-cover-el="caption"]')!.textContent).toBe("FOUR\nCASTER OPERATOR");

  const card = root.querySelector("[data-neon-card]")!.getBoundingClientRect();
  const h = parts[0].getBoundingClientRect();
  expect(h.left).toBeGreaterThan(card.left);
  expect(six.right).toBeLessThan(card.right + 40);
  expect(six.right).toBeLessThan(canvas.right);
  for (const id of ["backdrop", "ghost", "brush", "disc", "card", "badges", "record", "tag", "countdown"]) {
    expect(root.querySelector(`[data-cover-el="${id}"]`), id).not.toBeNull();
  }
  expect(root.querySelector("[data-saw-disc] filter feDisplacementMap")).not.toBeNull();
  expect(root.querySelector("[data-brush-strokes] feTurbulence")).not.toBeNull();
});

test("默认荒芜拉普兰德按手描轮廓去掉碎片，残影同样处理；换立绘就不挖", async () => {
  const screen = await render(cover({ imageUrl: artUrl("char_1038_whitw2_1") }));
  const root = screen.container;
  const main = root.querySelector("[data-unveil-art] img") as HTMLImageElement;
  expect(getComputedStyle(main).maskImage).toContain("data:image/svg+xml");
  const echo = root.querySelector('[data-cover-el="ghost"] [data-art-echo] img') as HTMLImageElement;
  expect(getComputedStyle(echo).maskImage).toContain("data:image/svg+xml");

  const other = await render(cover({ imageUrl: artUrl("char_1038_whitw2") }));
  expect(getComputedStyle(other.container.querySelector("[data-unveil-art] img")!).maskImage).toBe("none");
});

test("长关卡码和长标题自动缩字号，不出黑卡太多", async () => {
  const screen = await render(cover({ title: "四术师速通", subtitle: "CW-ST-10" }));
  await document.fonts.ready;
  const root = screen.container;
  const code = root.querySelector('[data-cover-el="code"]') as HTMLElement;
  const title = root.querySelector('[data-cover-el="title"]') as HTMLElement;
  expect(Number.parseFloat(getComputedStyle(code).fontSize)).toBeLessThan(400);
  expect(Number.parseFloat(getComputedStyle(title).fontSize)).toBeLessThan(158);
  expect(code.querySelectorAll("[data-code-star]").length).toBe(2);
  const card = root.querySelector("[data-neon-card]")!.getBoundingClientRect();
  const parts = [...code.querySelectorAll("[data-extrude-text]")];
  expect(parts.at(-1)!.getBoundingClientRect().right).toBeLessThan(card.right + 60);
  expect(title.querySelector("[data-extrude-text]")!.getBoundingClientRect().right).toBeLessThan(card.right + 40);
});

test("空稿使用荒芜拉普兰德精英 0 和参考图文案，图层顺序固定", () => {
  const draft = emptyDraft("unveil-brush");
  expect(draft.title).toBe("四术师");
  expect(draft.subtitle).toBe("H9-6");
  expect(draft.signature).toBe("LAPPLAND");
  expect(draft.mark).toBe("FOUR\nCASTER OPERATOR");
  expect(draft.operatorId).toBe("char_1038_whitw2");
  expect(draft.artId).toBe("char_1038_whitw2_1");
  expect(draft.imageScale).toBe(251);
  expect(draft.imageX).toBe(840);
  expect(draft.imageY).toBe(126);
  expect(draft.canvasSkin).toBe("unveil-brush");
  expect(draft.layers.map((layer) => layer.id)).toEqual([
    "backdrop", "ghost", "brush", "disc", "operator", "card", "badges", "name", "title", "code", "caption", "record", "tag", "countdown",
  ]);
});

function EditorPreview() {
  const { draft, templateId } = useCover();
  return (
    <>
      <EditorPanel />
      <div style={{ width: 960, height: 540 }}>
        <CoverView
          {...draftToRenderProps(templateId, { ...draft, imageDataUrl: stubArt }, { previewScale: 0.5, onImageDrag: () => undefined, showPlaceholder: false })}
        />
      </div>
    </>
  );
}

test("编辑器里改关卡码和英文名牌，大字转大写并存进草稿", async () => {
  const screen = await render(
    <CoverProvider templateId="unveil-brush">
      <EditorPreview />
    </CoverProvider>,
  );
  const root = screen.container;
  await screen.getByRole("textbox", { name: "关卡码大字" }).fill("h8-4");
  await expect.poll(() => [...root.querySelectorAll('[data-cover-el="code"] [data-extrude-text]')].map((p) => p.lastElementChild!.textContent)).toEqual(["H8", "4"]);
  await expect.poll(() => loadDraft("unveil-brush").subtitle).toBe("h8-4");

  await screen.getByRole("textbox", { name: "英文名牌" }).fill("Texas");
  await expect.poll(() => root.querySelector('[data-cover-el="name"]')?.textContent).toBe("Texas");
});

test("空白画布能加斜向干笔刷、锯齿红盘、霓虹黑卡和挤出网点字", async () => {
  const draft = emptyDraft("plain");
  const extrude = getTextStyle("extrude")!;
  const screen = await render(
    <div style={{ width: 1920, height: 1080, position: "relative" }}>
      <div className="font-fraunces">{renderTextContent(textLayer({ id: "t1", x: 0, y: 0, ...extrude.layer }), draft, null)}</div>
      {["brush-strokes", "saw-disc", "neon-card"].map((id) => (
        <div key={id} style={{ position: "relative", width: 1920, height: 1080 }}>
          {renderBoxChrome(boxLayer({ id, ...getDecoration(id)!.layer }))}
        </div>
      ))}
    </div>,
  );
  const root = screen.container;
  expect(root.querySelector("[data-extrude-text]")!.lastElementChild!.textContent).toBe("H9-6");
  expect(root.querySelectorAll("[data-brush-strokes] path").length).toBeGreaterThan(8);
  expect(root.querySelector('[data-saw-disc] circle[fill="#e3173b"]')).not.toBeNull();
  expect(root.querySelector("[data-saw-disc]")!.textContent).toContain("5.6");
  expect(root.querySelector("[data-neon-card]")).not.toBeNull();
  expect(getDecoration("neon-card")!.behindArt).toBeFalsy();
});
