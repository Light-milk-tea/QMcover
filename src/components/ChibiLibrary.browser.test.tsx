import { useRef } from "react";
import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../index.css";
import { findOperator } from "../data/arts";
import { chibiUrl, defaultChibiPick, followingChibiPatch, resolveChibiUrl } from "../data/chibis";
import { emptyDraft, saveDraft } from "../lib/storage";
import { CoverProvider, useCover } from "../store/CoverContext";
import { CoverStage } from "./CoverStage";
import { EditorPanel } from "./EditorPanel";
import { InspectorPanel } from "./InspectorPanel";

const stubChibi =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='64'%3E%3Crect width='40' height='64' fill='%2369c'%3E%3C/rect%3E%3C/svg%3E";

function ChibiFixture() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { selectedLayer, patchLayer } = useCover();
  return (
    <div style={{ display: "flex", width: 1400, height: 720, gap: 12 }}>
      <InspectorPanel />
      <div style={{ width: 720, height: 405 }}>
        <CoverStage stageRef={stageRef} />
      </div>
      <EditorPanel />
      <button
        type="button"
        onClick={() => {
          if (selectedLayer?.kind !== "image") return;
          patchLayer(selectedLayer.id, {
            source: "chibi",
            imageDataUrl: stubChibi,
            imageUrl: "",
          });
        }}
      >
        选入stub小人
      </button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

test("默认小人优先精0站姿", () => {
  expect(defaultChibiPick("char_4182_oblvns")).toMatchObject({
    operatorId: "char_4182_oblvns",
    artId: "char_4182_oblvns_1",
    imageUrl: chibiUrl("char_4182_oblvns"),
  });
});

test("空小人层跟着新干员补目录静帧，上传或另选过的不覆盖", () => {
  const amiya = findOperator("char_002_amiya")!;
  const oblivnis = findOperator("char_4182_oblvns")!;
  const skin = oblivnis.arts.find((art) => art.id === "char_4182_oblvns_avemujica#1");
  expect(
    followingChibiPatch({ operatorId: "", imageDataUrl: "" }, "char_4182_oblvns", amiya, amiya.arts[0]),
  ).toMatchObject({
    source: "chibi",
    operatorId: "char_002_amiya",
    imageUrl: chibiUrl("char_002_amiya"),
  });
  expect(
    followingChibiPatch({ operatorId: "char_4182_oblvns", imageDataUrl: "" }, "char_4182_oblvns", oblivnis, skin),
  ).toMatchObject({
    artId: "char_4182_oblvns_avemujica#1",
    imageUrl: chibiUrl("char_4182_oblvns_avemujica#1"),
  });
  expect(
    followingChibiPatch(
      { operatorId: "char_4182_oblvns", imageDataUrl: "data:image/png;base64,xx" },
      "char_4182_oblvns",
      amiya,
      amiya.arts[0],
    ),
  ).toBeNull();
  expect(
    followingChibiPatch(
      { operatorId: "char_002_amiya", imageDataUrl: "" },
      "char_4182_oblvns",
      findOperator("char_512_aprot")!,
      { id: "char_512_aprot_1", kind: "elite0" },
    ),
  ).toBeNull();
});

test("开发环境小人地址走本地 /chibi，旧 CDN 稿也会改写", () => {
  expect(chibiUrl("char_4182_oblvns")).toBe("/chibi/char_4182_oblvns.png");
  expect(chibiUrl("char_002_amiya_winter#1")).toBe("/chibi/char_002_amiya_winter-1.png");
  expect(
    resolveChibiUrl({
      imageUrl: "https://gcore.jsdelivr.net/gh/Light-milk-tea/ArknightsChibi@main/chibi/char_4182_oblvns.png",
      operatorId: "char_4182_oblvns",
    }),
  ).toBe("/chibi/char_4182_oblvns.png");
});

test("添加菜单可以加入小人层", async () => {
  saveDraft("blank", emptyDraft("blank"));
  const screen = await render(
    <CoverProvider templateId="blank">
      <ChibiFixture />
    </CoverProvider>,
  );

  await screen.getByText("添加", { exact: true }).click();
  await expect.element(screen.getByRole("button", { name: "小人", exact: true })).toBeVisible();
  await screen.getByRole("button", { name: "小人", exact: true }).click();
  await expect.element(screen.getByRole("button", { name: /^小人/ })).toBeVisible();
  await expect.element(screen.getByText("小人库", { exact: true })).toBeVisible();
});

test("点选 stub 小人后画布出现图片，不走真实 CDN", async () => {
  saveDraft("blank", emptyDraft("blank"));
  const screen = await render(
    <CoverProvider templateId="blank">
      <ChibiFixture />
    </CoverProvider>,
  );

  await screen.getByText("添加", { exact: true }).click();
  await screen.getByRole("button", { name: "小人", exact: true }).click();
  await screen.getByRole("button", { name: "选入stub小人" }).click();

  await expect.poll(() => {
    const imgs = [...screen.container.querySelectorAll<HTMLImageElement>("[data-cover-el] img")];
    return imgs.some((img) => img.getAttribute("src") === stubChibi);
  }).toBe(true);
  const canvasImgs = [...screen.container.querySelectorAll<HTMLImageElement>("[data-cover-el] img")];
  expect(canvasImgs.every((img) => {
    const src = img.getAttribute("src") ?? "";
    return src.startsWith("data:") && !src.includes("ArknightsChibi") && !src.includes("/skin/");
  })).toBe(true);
});

test("旧 CDN 小人稿在开发环境改走本地静帧", async () => {
  const draft = emptyDraft("blank");
  saveDraft("blank", {
    ...draft,
    layers: [
      {
        id: "el-chibi",
        kind: "image" as const,
        source: "chibi" as const,
        label: "小人",
        x: 80,
        y: 80,
        w: 248,
        h: 400,
        operatorId: "char_4182_oblvns",
        artId: "char_4182_oblvns_1",
        imageUrl: "https://gcore.jsdelivr.net/gh/Light-milk-tea/ArknightsChibi@main/chibi/char_4182_oblvns.png",
        objectFit: "contain" as const,
        objectPosition: "center bottom",
      },
    ],
  });
  const screen = await render(
    <CoverProvider templateId="blank">
      <ChibiFixture />
    </CoverProvider>,
  );
  await expect
    .poll(() => screen.container.querySelector<HTMLImageElement>("[data-cover-el] img")?.getAttribute("src"))
    .toBe("/chibi/char_4182_oblvns.png");
});
