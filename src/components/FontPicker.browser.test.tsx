import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../index.css";
import { buildDocumentFile, textLayer } from "../lib/document";
import { emptyDraft, loadDraft, saveDraft } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import { CoverView } from "../templates/registry";
import type { CoverFontId } from "../types";
import { draftToRenderProps } from "./CoverStage";
import { InspectorPanel } from "./InspectorPanel";

function Fixture() {
  const { draft, selectElement } = useCover();
  return <>
    <button onClick={() => selectElement("name")}>编辑干员字体</button>
    <button onClick={() => selectElement("free-title")}>编辑自由文字字体</button>
    <InspectorPanel />
    <div style={{ width: 1920, height: 1080 }}>
      <CoverView {...draftToRenderProps("strength-review", draft, { previewScale: 1, onImageDrag: () => undefined })} />
    </div>
  </>;
}

beforeEach(() => {
  localStorage.clear();
  const draft = emptyDraft("strength-review");
  saveDraft("strength-review", {
    ...draft,
    layers: [...draft.layers, textLayer({
      id: "free-title", label: "自由标题", x: 0, y: 0, w: 1000, h: 160,
      text: "丰川祥子", font: "cn", fontSize: 100, effect: "gold-title",
    })],
  });
});

test("字体菜单切换真实字体和字重，描边与字面一致，保存后可恢复", async () => {
  const screen = await render(<CoverProvider templateId="strength-review"><Fixture /></CoverProvider>);
  await screen.getByRole("button", { name: "编辑干员字体" }).click();
  const select = screen.getByRole("combobox", { name: "字体", exact: true });
  const choices: [CoverFontId, string, string][] = [
    ["serif-regular", "Noto Serif SC", "400"],
    ["serif-medium", "Noto Serif SC", "500"],
    ["cn-regular", "Noto Sans SC", "400"],
    ["wenkai", "LXGW WenKai", "500"],
    ["xiaowei", "ZCOOL XiaoWei", "400"],
    ["mashan", "Ma Shan Zheng", "400"],
  ];
  for (const [id, family, weight] of choices) {
    await select.selectOptions(id);
    const faces = await document.fonts.load(`${weight} 64px "${family}"`, "丰川祥子强度测评");
    expect(faces.length).toBeGreaterThan(0);
    expect(faces.every((face) => face.status === "loaded")).toBe(true);
    for (const span of screen.container.querySelectorAll('[data-cover-el="name"] [data-type-face] span')) {
      expect(getComputedStyle(span).fontFamily).toContain(family);
      expect(getComputedStyle(span).fontWeight).toBe(weight);
    }
    expect(loadDraft("strength-review").elementStyles.name.font).toBe(id);
  }
}, 30000);

test("自由文字的金色字效也遵循所选字体，不被内部粗体覆盖", async () => {
  const screen = await render(<CoverProvider templateId="strength-review"><Fixture /></CoverProvider>);
  await screen.getByRole("button", { name: "编辑自由文字字体" }).click();
  await screen.getByRole("combobox", { name: "字体", exact: true }).selectOptions("xiaowei");
  await document.fonts.load('400 64px "ZCOOL XiaoWei"', "丰川祥子");
  const spans = screen.container.querySelectorAll('[data-cover-el="free-title"] span');
  expect(spans.length).toBeGreaterThan(1);
  for (const span of spans) {
    expect(getComputedStyle(span).fontFamily).toContain("ZCOOL XiaoWei");
    expect(getComputedStyle(span).fontWeight).toBe("400");
  }
  expect(loadDraft("strength-review").layers.find((layer) => layer.id === "free-title"))
    .toMatchObject({ font: "xiaowei" });
});


test("展开字样后可直接选字体，预览使用当前标题", async () => {
  const screen = await render(<CoverProvider templateId="strength-review"><Fixture /></CoverProvider>);
  await screen.getByRole("button", { name: "编辑干员字体" }).click();
  const preview = screen.container.querySelector("[data-font-preview]")!;
  expect(preview.textContent).toBe("丰川祥子");
  await screen.getByRole("button", { name: "展开字体预览" }).click();
  await screen.getByRole("button", { name: "使用霞鹜文楷", exact: true }).click();
  await expect.element(screen.getByRole("combobox", { name: "字体", exact: true })).toHaveValue("wenkai");
  expect(getComputedStyle(preview).fontFamily).toContain("LXGW WenKai");
  await screen.getByRole("button", { name: "收起字体预览" }).click();
  await expect.element(screen.getByRole("button", { name: "展开字体预览" })).toHaveAttribute("aria-expanded", "false");
});

test("字距调整改变实际文字宽度，描边同步，草稿与配置都保留", async () => {
  const screen = await render(<CoverProvider templateId="strength-review"><Fixture /></CoverProvider>);
  await screen.getByRole("button", { name: "编辑干员字体" }).click();
  await document.fonts.ready;
  const face = screen.container.querySelector('[data-cover-el="name"] .sr-gold-fill')!;
  const before = face.getBoundingClientRect().width;
  await screen.getByRole("spinbutton", { name: "字距（px）", exact: true }).fill("18");
  expect(face.getBoundingClientRect().width).toBeGreaterThan(before + 25);
  for (const span of screen.container.querySelectorAll('[data-cover-el="name"] [data-type-face] span')) {
    expect(getComputedStyle(span).letterSpacing).toBe("18px");
  }
  await screen.getByRole("button", { name: "编辑自由文字字体" }).click();
  await screen.getByRole("spinbutton", { name: "字距（px）", exact: true }).fill("12");
  for (const span of screen.container.querySelectorAll('[data-cover-el="free-title"] span')) {
    expect(getComputedStyle(span).letterSpacing).toBe("12px");
  }
  const restored = loadDraft("strength-review");
  expect(restored.elementStyles.name.letterSpacing).toBe(18);
  expect(restored.layers.find((layer) => layer.id === "free-title")).toMatchObject({ letterSpacing: 12 });
  const config = buildDocumentFile(restored).document;
  expect(config.elementStyles?.name.letterSpacing).toBe(18);
  expect(config.layers.find((layer) => layer.id === "free-title")).toMatchObject({ letterSpacing: 12 });
});
