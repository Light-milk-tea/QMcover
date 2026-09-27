import { useEffect, useRef } from "react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../index.css";
import { STORAGE_KEY } from "../constants";
import { findOperator, operatorSkills } from "../data/arts";
import { boxLayer, textLayer } from "../lib/document";
import { disableCoverEffects } from "../lib/effects";
import { rasterizeCoverPng } from "../lib/exportCover";
import { emptyDraft, loadDraft, saveDraft } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import { CoverStage } from "./CoverStage";
import { EditorPanel } from "./EditorPanel";
import { EffectsPanel } from "./EffectsPanel";
import { InspectorPanel } from "./InspectorPanel";

function Workbench() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { selectedLayer } = useCover();
  const effect = selectedLayer?.kind === "text" ? (selectedLayer.effect ?? "") : selectedLayer?.kind === "box" ? (selectedLayer.chrome ?? "") : "";
  return (
    <>
      <EffectsPanel />
      <div style={{ display: "flex", width: 1500, height: 820, gap: 12 }}>
        <InspectorPanel />
        <div style={{ width: 800, height: 450 }}>
          <CoverStage stageRef={stageRef} />
        </div>
        <EditorPanel />
      </div>
      <output data-testid="selected">{selectedLayer ? `${selectedLayer.id}|${effect}` : ""}</output>
    </>
  );
}

function renderBlank() {
  return render(
    <CoverProvider templateId="blank">
      <Workbench />
    </CoverProvider>,
  );
}

type Screen = Awaited<ReturnType<typeof renderBlank>>;

const frame = (id: string) => document.querySelector<HTMLElement>(`[data-cover-el="${id}"]`);
const selectedId = (text: string | null | undefined) => text?.split("|")[0] ?? "";
const layerRow = (screen: Screen, name: string) =>
  screen.getByRole("list", { name: "图层列表" }).getByRole("button", { name, exact: true });

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  window.confirm = () => true;
});

test("空白画布默认带示范框架，右侧改标题后画布同步", async () => {
  const screen = await renderBlank();

  for (const name of ["文字侧压暗", "立绘", "标题下划线", "角标", "标题", "副标题", "期数", "署名"]) {
    await expect.element(layerRow(screen, name)).toBeVisible();
  }
  expect(frame("blank-title")?.textContent).toContain("封面标题");
  expect(frame("blank-subtitle")?.textContent).toContain("副标题写在这里");
  expect(frame("blank-mark")?.textContent).toContain("栏目名");
  expect(frame("blank-episode")?.textContent).toContain("第1期");
  expect(frame("blank-signature")?.textContent).toContain("UP 主署名");
  expect(frame("operator")?.querySelector("img")?.getAttribute("src")).toContain("char_002_amiya_1");
  expect(loadDraft("blank").bgPreset).toBe("lungmen-night");

  await screen.getByRole("textbox", { name: "标题", exact: true }).fill("危机合约第九期");
  await expect.poll(() => frame("blank-title")?.textContent).toContain("危机合约第九期");
});

test("长标题自动缩小，不超出标题框", async () => {
  const screen = await renderBlank();
  await screen.getByRole("textbox", { name: "标题", exact: true }).fill("这是一个非常非常长的示范封面标题");
  await expect.poll(() => frame("blank-title")?.textContent).toContain("示范封面标题");
  const box = frame("blank-title")!;
  const face = box.querySelector("span")!;
  expect(parseFloat(face.style.fontSize)).toBeLessThan(200);
  expect(face.getBoundingClientRect().width).toBeLessThanOrEqual(box.getBoundingClientRect().width + 1);
});

test("字段没有图层显示时出现「放到画布」，点一下补回绑定图层", async () => {
  const screen = await renderBlank();
  expect(screen.getByRole("button", { name: "把副标题放到画布" }).query()).toBeNull();

  await layerRow(screen, "副标题").click();
  await screen.getByRole("button", { name: "删除", exact: true }).click();
  expect(frame("blank-subtitle")).toBeNull();

  const place = screen.getByRole("button", { name: "把副标题放到画布" });
  await expect.element(place).toBeVisible();
  await place.click();
  const status = screen.getByTestId("selected");
  await expect.element(status).not.toHaveTextContent("");
  const id = selectedId(status.element().textContent);
  expect(frame(id)?.textContent).toContain("副标题写在这里");
  expect(loadDraft("blank").layers.find((layer) => layer.id === id)).toMatchObject({ kind: "text", bind: "subtitle", x: 150, y: 566 });
  expect(screen.getByRole("button", { name: "把副标题放到画布" }).query()).toBeNull();
});

test("清空图层后可一键恢复示范框架", async () => {
  window.confirm = () => true;
  const screen = await renderBlank();

  await screen.getByRole("button", { name: "清空", exact: true }).click();
  await expect.element(screen.getByText("还没有图层，点添加开始排版。")).toBeVisible();
  expect(loadDraft("blank").layers).toHaveLength(0);
  await expect.element(screen.getByRole("button", { name: "把标题放到画布" })).toBeVisible();

  await screen.getByRole("button", { name: "恢复示范框架" }).click();
  await expect.element(layerRow(screen, "文字侧压暗")).toBeVisible();
  expect(loadDraft("blank").layers.map((layer) => layer.id)).toContain("blank-title");
  expect(frame("blank-title")?.textContent).toContain("封面标题");
});

test("清空后右侧可把立绘放回画布，沿用当前干员", async () => {
  window.confirm = () => true;
  const screen = await renderBlank();
  await screen.getByRole("button", { name: "清空", exact: true }).click();

  const place = screen.getByRole("button", { name: "把立绘放到画布" });
  await expect.element(place).toBeVisible();
  await place.click();
  await expect
    .poll(() => loadDraft("blank").layers.find((layer) => layer.id === "operator"))
    .toMatchObject({ kind: "image", x: 1060, y: -30, artId: "char_002_amiya_1" });
  await expect.element(screen.getByText("立绘库", { exact: true })).toBeVisible();
  expect(screen.getByRole("button", { name: "把立绘放到画布" }).query()).toBeNull();
});

test("旧版零图层空白稿只补一次示范框架，自己的文案保留，之后清空不再补", () => {
  const old = { ...emptyDraft("blank"), layers: [], bgPreset: "ink", title: "我的标题", subtitle: "", mark: "", signature: "" };
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ drafts: { blank: old }, defaultsVersion: 41 }));

  const migrated = loadDraft("blank");
  expect(migrated.layers.map((layer) => layer.id)).toEqual(expect.arrayContaining(["operator", "blank-title", "blank-subtitle"]));
  expect(migrated.bgPreset).toBe("lungmen-night");
  expect(migrated.title).toBe("我的标题");
  expect(migrated.subtitle).toBe("副标题写在这里");

  saveDraft("blank", { ...migrated, layers: [] });
  expect(loadDraft("blank").layers).toHaveLength(0);
});

test("添加文字可从模板字效库选择，色散标题实际渲染", async () => {
  const screen = await renderBlank();
  await screen.getByText("添加", { exact: true }).click();
  await screen.getByRole("button", { name: "文字", exact: true }).click();
  await expect.element(screen.getByTestId("text-style-picker")).toBeVisible();
  for (const name of ["普通文字", "描边金字", "色散标题", "粉色条件字", "品红投影数字", "金属字", "金纹字", "全息字", "叠影标题", "柔影白字", "硬投影字", "空心水印", "透景玻璃字", "颗粒关卡码", "手写花体", "纯色字（浅底）"]) {
    await expect.element(screen.getByRole("button", { name, exact: true })).toBeInTheDocument();
  }

  await screen.getByRole("button", { name: "色散标题", exact: true }).click();
  const status = screen.getByTestId("selected");
  await expect.element(status).toHaveTextContent("|chromatic");
  const id = selectedId(status.element().textContent);
  expect(frame(id)?.querySelector("[data-title-face]")?.textContent).toBe("紧急授课");
  await expect.element(screen.getByRole("combobox", { name: "字效", exact: true })).toHaveValue("chromatic");
});

test("字效下拉可把示范标题切换成金属字、全息字和纯色字", async () => {
  const screen = await renderBlank();
  await layerRow(screen, "标题").click();
  const select = screen.getByRole("combobox", { name: "字效", exact: true });

  await select.selectOptions("metal");
  await expect.poll(() => frame("blank-title")?.querySelector(".sr-gold-fill")?.textContent).toBe("封面标题");
  await select.selectOptions("matrix");
  await expect.poll(() => frame("blank-title")?.querySelector("[data-matrix-ink]")?.textContent).toBe("封面标题");
  await select.selectOptions("magenta-shadow");
  await expect.poll(() => (frame("blank-title")?.querySelector("span span") as HTMLElement | null)?.style.textShadow).toContain("rgba(156, 31, 113, 0.58)");
  await select.selectOptions("pink");
  await expect.poll(() => frame("blank-title")?.querySelectorAll("span").length).toBeGreaterThan(2);
  expect(frame("blank-title")?.textContent).toContain("封面标题");
  await select.selectOptions("plain");
  await expect.poll(() => frame("blank-title")?.querySelector(".cover-type-shadow")).toBeNull();
  expect(frame("blank-title")?.textContent).toContain("封面标题");
  expect(loadDraft("blank").layers.find((layer) => layer.id === "blank-title")).toMatchObject({ effect: "plain" });
});

test("套用字效预设一次换掉字体、字效和颜色，文字和绑定不变", async () => {
  const screen = await renderBlank();
  await layerRow(screen, "标题").click();
  const presets = screen.getByRole("combobox", { name: "套用字效预设", exact: true });
  const title = () => loadDraft("blank").layers.find((layer) => layer.id === "blank-title");

  await presets.selectOptions("metal");
  await expect.poll(() => title()).toMatchObject({ font: "serif-medium", effect: "metal", color: "#d5dce4", bind: "title", x: 140, y: 258 });
  expect(frame("blank-title")?.querySelector(".sr-gold-fill")?.textContent).toBe("封面标题");
  await expect.element(presets).toHaveValue("");

  await presets.selectOptions("grain-stage");
  await expect.poll(() => frame("blank-title")?.querySelector("[data-stage-grain]")?.getAttribute("data-grain-tint")).toBe("#f50039");
  await expect.poll(() => frame("blank-title")?.querySelector("[data-stage-grain]")?.getAttribute("data-grain-ready")).toBe("true");
});

test("装饰库按分类列出各模板的氛围和构件，加入后可改色", async () => {
  const screen = await renderBlank();
  await screen.getByText("添加", { exact: true }).click();
  await screen.getByRole("button", { name: "装饰", exact: true }).click();
  for (const name of ["氛围光效", "纹理材质", "几何线框", "条带色块", "小标记", "方舟饰件", "职业图标"]) {
    await expect.element(screen.getByRole("group", { name, exact: true })).toBeInTheDocument();
  }
  for (const name of ["紫黑氛围", "立绘暗角", "冷色压暗", "紫色角光", "红雾", "矿物底纹", "战术圆环", "关卡箭头", "六角栏目条", "撕纸"]) {
    await expect.element(screen.getByRole("button", { name, exact: true })).toBeInTheDocument();
  }
  await screen.getByRole("button", { name: "紫色光痕", exact: true }).click();
  const status = screen.getByTestId("selected");
  await expect.element(status).toHaveTextContent("|violet-streaks");
  const streaks = selectedId(status.element().textContent);
  expect(frame(streaks)!.querySelectorAll("path").length).toBeGreaterThan(20);
  // A full-canvas wash lands above the art but under the text.
  const order = loadDraft("blank").layers.map((layer) => layer.id);
  expect(order.indexOf(streaks)).toBeGreaterThan(order.indexOf("operator"));
  expect(order.indexOf(streaks)).toBeLessThan(order.indexOf("blank-mark"));
  expect(Number(frame(streaks)!.style.zIndex)).toBeLessThan(Number(frame("blank-title")!.style.zIndex));

  await screen.getByText("添加", { exact: true }).click();
  await screen.getByRole("button", { name: "装饰", exact: true }).click();
  await screen.getByRole("button", { name: "紫黑氛围", exact: true }).click();
  await expect.element(status).toHaveTextContent("|violet-atmosphere");
  const mist = selectedId(status.element().textContent);
  const withMist = loadDraft("blank").layers.map((layer) => layer.id);
  expect(withMist.indexOf(mist)).toBeLessThan(withMist.indexOf("operator"));
  expect(frame(mist)!.querySelectorAll("path").length).toBeGreaterThan(4);

  await screen.getByText("添加", { exact: true }).click();
  await screen.getByRole("button", { name: "装饰", exact: true }).click();
  await screen.getByRole("button", { name: "四角星", exact: true }).click();
  await expect.element(status).toHaveTextContent("|ak-star");
  expect(loadDraft("blank").layers.at(-1)?.id).toBe(selectedId(status.element().textContent));

  await screen.getByText("添加", { exact: true }).click();
  await screen.getByRole("button", { name: "装饰", exact: true }).click();
  await screen.getByRole("button", { name: "光泽斜切", exact: true }).click();
  await expect.element(status).toHaveTextContent("|glossy-slash");
  const slash = () => frame(selectedId(status.element().textContent))!.querySelector("[data-slash] stop[offset='0.38']");
  expect(slash()?.getAttribute("stop-color")).toBe("#f50039");
});

test("技能图标和灰色叠影装饰跟随当前干员", async () => {
  const screen = await renderBlank();
  const status = screen.getByTestId("selected");

  await screen.getByText("添加", { exact: true }).click();
  await screen.getByRole("button", { name: "装饰", exact: true }).click();
  await screen.getByRole("button", { name: "技能图标", exact: true }).click();
  await expect.element(status).toHaveTextContent("|skill-icons");
  const row = frame(selectedId(status.element().textContent))!;
  const skills = operatorSkills(findOperator("char_002_amiya"));
  expect(skills.length).toBeGreaterThan(0);
  expect([...row.querySelectorAll("[data-skill-icon]")].map((img) => img.getAttribute("data-skill-id"))).toEqual(
    skills.map((skill) => skill.iconId),
  );

  await screen.getByText("添加", { exact: true }).click();
  await screen.getByRole("button", { name: "装饰", exact: true }).click();
  await screen.getByRole("button", { name: "灰色叠影", exact: true }).click();
  await expect.element(status).toHaveTextContent("|art-echo");
  const echoId = selectedId(status.element().textContent);
  const echo = frame(echoId)!.querySelector("img")!;
  expect(echo.getAttribute("src")).toContain("char_002_amiya_1");
  expect(echo.style.filter).toContain("grayscale(1)");
  const order = loadDraft("blank").layers.map((layer) => layer.id);
  expect(order.indexOf(echoId)).toBeLessThan(order.indexOf("operator"));
});

test("自由文字可选模板里用到的新字体，并加载真实字形", async () => {
  const screen = await renderBlank();
  await layerRow(screen, "标题").click();
  const select = screen.getByRole("combobox", { name: "字体", exact: true });
  const choices: [string, string, string][] = [
    ["outfit", "Outfit Variable", "900"],
    ["hand", "Vanguard Hand", "400"],
    ["alex", "Alex Brush", "400"],
    ["vibes", "Great Vibes", "400"],
  ];
  for (const [id, family, weight] of choices) {
    await select.selectOptions(id);
    const faces = await document.fonts.load(`${weight} 64px "${family}"`, "Vanguard 5");
    expect(faces.length).toBeGreaterThan(0);
    expect(faces.every((face) => face.status === "loaded")).toBe(true);
    const face = frame("blank-title")!.querySelector("span")!;
    expect(getComputedStyle(face).fontFamily).toContain(family);
    expect(getComputedStyle(face).fontWeight).toBe(weight);
  }
}, 30000);

test("光效在空白画布上默认打在立绘下，可切到立绘上", async () => {
  const screen = await renderBlank();
  const light = () => document.querySelector<HTMLElement>("[data-light-depth]");
  const art = () => frame("operator")!;
  await expect.poll(() => light()?.dataset.lightDepth).toBe("behind");
  expect(light()!.style.zIndex).toBe(art().style.zIndex);
  expect(light()!.compareDocumentPosition(art()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(frame("blank-title")!.style.zIndex > art().style.zIndex).toBe(true);

  await screen.getByRole("button", { name: /^特效/ }).click();
  await screen.getByRole("button", { name: "立绘上", exact: true }).click();
  await expect.poll(() => light()?.dataset.lightDepth).toBe("front");
  expect(art().compareDocumentPosition(light()!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test("套用模板构图时暂时收起自己排的图层，切回不套用后原样恢复", async () => {
  const screen = await renderBlank();
  const layer = (id: string) => loadDraft("blank").layers.find((item) => item.id === id);
  const free = ["blank-shade", "blank-rule", "blank-mark", "blank-title", "blank-subtitle", "blank-episode", "blank-signature"];

  await screen.getByRole("combobox", { name: "套用模板构图", exact: true }).selectOptions("lowspec");
  await expect.poll(() => layer("blank-title")?.hidden).toBe(true);
  expect(loadDraft("blank").canvasSkin).toBe("lowspec");
  for (const id of free) expect(layer(id)).toMatchObject({ hidden: true, skinHidden: true });
  expect(layer("operator")?.hidden).toBeFalsy();
  await expect.poll(() => frame("operation")?.textContent).toContain("封面标题");
  expect(frame("blank-mark")?.style.display).toBe("none");

  await screen.getByRole("combobox", { name: "套用模板构图", exact: true }).selectOptions("plain");
  await expect.poll(() => layer("blank-title")?.hidden).toBe(false);
  for (const id of free) {
    expect(layer(id)?.hidden).toBe(false);
    expect(layer(id)).not.toHaveProperty("skinHidden");
  }
  await expect.poll(() => frame("blank-title")?.textContent).toContain("封面标题");
});

test("新字效和模板装饰经 html-to-image 导出后仍保留字面和纹理", { timeout: 60_000 }, async () => {
  const base = emptyDraft("blank");
  saveDraft("blank", {
    ...base,
    bgPreset: "ink",
    effects: disableCoverEffects(base.effects),
    layers: [
      boxLayer({ id: "streaks", label: "紫色光痕", x: 0, y: 0, w: 1920, h: 1080, chrome: "violet-streaks" }),
      boxLayer({ id: "slash", label: "光泽斜切", x: 156, y: -78, w: 1920, h: 1080, chrome: "glossy-slash", color: "#f50039" }),
      textLayer({ id: "t-chromatic", label: "色散", x: 100, y: 80, w: 900, h: 220, text: "紧急授课", font: "serif", fontSize: 180, color: "#ffffff", effect: "chromatic" }),
      textLayer({ id: "t-metal", label: "金属", x: 100, y: 330, w: 900, h: 220, text: "强度测评", font: "serif-medium", fontSize: 180, color: "#d5dce4", effect: "metal" }),
      textLayer({ id: "t-matrix", label: "全息", x: 100, y: 580, w: 900, h: 220, text: "四人全息", font: "cn", fontSize: 170, color: "#a468d6", effect: "matrix" }),
      textLayer({ id: "t-grain", label: "金纹", x: 100, y: 820, w: 900, h: 230, text: "H9-5", font: "outfit", fontSize: 200, color: "#fffefb", effect: "gold-grain" }),
    ],
  });
  let stage: HTMLDivElement | null = null;
  await render(
    <CoverProvider templateId="blank">
      <ExportStage onStage={(el) => { stage = el; }} />
    </CoverProvider>,
  );
  await document.fonts.load('900 180px "Noto Serif SC"', "紧急授课");
  await document.fonts.load('500 180px "Noto Serif SC"', "强度测评");
  await document.fonts.load('900 170px "Noto Sans SC"', "四人全息");
  await document.fonts.load('900 200px "Outfit Variable"', "H9-5");
  await expect.poll(() => stage).not.toBeNull();
  const image = new Image();
  image.src = await rasterizeCoverPng(stage!);
  await image.decode();
  expect([image.naturalWidth, image.naturalHeight]).toEqual([1920, 1080]);
  const canvas = document.createElement("canvas");
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, 0, 0);
  const count = (x: number, y: number, w: number, h: number, test: (r: number, g: number, b: number) => boolean) => {
    const data = ctx.getImageData(x, y, w, h).data;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) if (test(data[i], data[i + 1], data[i + 2])) n += 1;
    return n;
  };
  const bright = (r: number, g: number, b: number) => r + g + b > 560;
  expect(count(100, 80, 900, 220, bright)).toBeGreaterThan(4000);
  expect(count(100, 330, 900, 220, bright)).toBeGreaterThan(4000);
  expect(count(100, 580, 900, 220, bright)).toBeGreaterThan(4000);
  expect(count(100, 820, 900, 230, bright)).toBeGreaterThan(4000);
  expect(count(1400, 0, 520, 240, (r, g, b) => r > 170 && g < 90 && b < 110)).toBeGreaterThan(2000);
  expect(count(1400, 40, 520, 380, (r, g, b) => r > 150 && b > 130 && g < 110)).toBeGreaterThan(200);
});

function ExportStage({ onStage }: { onStage: (el: HTMLDivElement | null) => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => onStage(stageRef.current));
  return (
    <div style={{ width: 960, height: 540 }}>
      <CoverStage stageRef={stageRef} />
    </div>
  );
}
