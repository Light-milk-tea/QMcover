import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import "../index.css";
import { OperatorLayer } from "./OperatorLayer";

const PINK =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#ff4d8d"/></svg>`,
  );

async function sample(el: HTMLElement) {
  const png = await page.screenshot({ element: el, save: false });
  const image = new Image();
  image.src = `data:image/png;base64,${png}`;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0);
  const at = (x: number, y: number) => context.getImageData(x, y, 1, 1).data;
  return { width: image.width, height: image.height, at };
}

test("边缘虚化后立绘中间仍在，不是只剩左上角", async () => {
  const screen = await render(
    <div data-testid="fade-stage" style={{ width: 400, height: 400, background: "#00c853" }}>
      <OperatorLayer
        imageUrl={PINK}
        imageScale={100}
        imageX={0}
        imageY={0}
        previewScale={1}
        imageEdgeFade
        imageEdgeFadeAmount={16}
        objectFit="cover"
        framed
        showPlaceholder={false}
        className="h-full w-full"
        onImageDrag={() => undefined}
      />
    </div>,
  );
  const stage = screen.getByTestId("fade-stage").element();
  if (!(stage instanceof HTMLElement)) throw new Error("舞台必须是 HTML 元素");
  const wrap = stage.querySelector("[data-cover-el='operator']");
  if (!(wrap instanceof HTMLElement)) throw new Error("立绘盒必须在");
  const img = wrap.querySelector("img");
  if (!(img instanceof HTMLImageElement)) throw new Error("立绘图必须在");
  await expect.poll(() => img.complete && img.naturalWidth > 0).toBe(true);
  await expect.poll(() => wrap.querySelector("[data-ignore-export]") === null).toBe(true);
  await expect.poll(() => Math.round(img.getBoundingClientRect().width)).toBeGreaterThan(350);

  const fadeX = wrap.querySelector("[data-edge-fade-x]");
  const fadeY = wrap.querySelector("[data-edge-fade-y]");
  if (!(fadeX instanceof HTMLElement) || !(fadeY instanceof HTMLElement)) throw new Error("虚化层必须在");
  expect(wrap.dataset.edgeFadeMode).toBe("all");
  expect(getComputedStyle(fadeX).maskImage).toContain("16%");
  expect(getComputedStyle(fadeX).maskSize).toContain("100%");
  expect(getComputedStyle(fadeY).maskImage).toContain("16%");
  expect(getComputedStyle(fadeY).maskSize).toContain("100%");

  const { width, height, at } = await sample(stage);
  const center = at(Math.floor(width / 2), Math.floor(height / 2));
  expect(center[0]).toBeGreaterThan(180);
  expect(center[1]).toBeLessThan(140);
  expect(center[2]).toBeGreaterThan(80);

  const midRight = at(Math.floor(width * 0.72), Math.floor(height / 2));
  expect(midRight[0]).toBeGreaterThan(160);
});

test("拉高立绘盒打开边缘虚化后中间仍在", async () => {
  const screen = await render(
    <div data-testid="fade-expand" style={{ width: 400, height: 400, background: "#00c853" }}>
      <OperatorLayer
        imageUrl={PINK}
        imageScale={100}
        imageX={0}
        imageY={0}
        previewScale={1}
        imageEdgeFade
        imageEdgeFadeAmount={16}
        objectFit="contain"
        showPlaceholder={false}
        className="h-full w-full"
        onImageDrag={() => undefined}
      />
    </div>,
  );
  const stage = screen.getByTestId("fade-expand").element();
  if (!(stage instanceof HTMLElement)) throw new Error("舞台必须是 HTML 元素");
  const wrap = stage.querySelector("[data-cover-el='operator']");
  if (!(wrap instanceof HTMLElement)) throw new Error("立绘盒必须在");
  const img = wrap.querySelector("img");
  if (!(img instanceof HTMLImageElement)) throw new Error("立绘图必须在");
  await expect.poll(() => img.complete && img.naturalWidth > 0).toBe(true);
  await expect.poll(() => wrap.querySelector("[data-ignore-export]") === null).toBe(true);

  const { width, height, at } = await sample(stage);
  const center = at(Math.floor(width / 2), Math.floor(height / 2));
  expect(center[0]).toBeGreaterThan(180);
  expect(center[1]).toBeLessThan(140);
});

test("近景下移后边缘虚化仍能看见立绘中段", async () => {
  const screen = await render(
    <div data-testid="fade-pan" style={{ width: 400, height: 400, background: "#00c853" }}>
      <OperatorLayer
        imageUrl={PINK}
        imageScale={220}
        imageX={0}
        imageY={-160}
        previewScale={1}
        imageEdgeFade
        imageEdgeFadeAmount={16}
        objectFit="contain"
        showPlaceholder={false}
        className="h-full w-full"
        onImageDrag={() => undefined}
      />
    </div>,
  );
  const stage = screen.getByTestId("fade-pan").element();
  if (!(stage instanceof HTMLElement)) throw new Error("舞台必须是 HTML 元素");
  const wrap = stage.querySelector("[data-cover-el='operator']");
  if (!(wrap instanceof HTMLElement)) throw new Error("立绘盒必须在");
  const img = wrap.querySelector("img");
  if (!(img instanceof HTMLImageElement)) throw new Error("立绘图必须在");
  await expect.poll(() => img.complete && img.naturalWidth > 0).toBe(true);
  await expect.poll(() => wrap.querySelector("[data-ignore-export]") === null).toBe(true);
  expect(wrap.querySelector("[data-art-pan]")).toBeTruthy();

  const { width, height, at } = await sample(stage);
  const center = at(Math.floor(width / 2), Math.floor(height / 2));
  expect(center[0]).toBeGreaterThan(180);
  expect(center[1]).toBeLessThan(140);
});

test("窄立绘盒打开边缘虚化后，放大溢出的右侧仍在", async () => {
  const screen = await render(
    <div data-testid="fade-overflow" style={{ width: 600, height: 400, background: "#00c853" }}>
      <OperatorLayer
        imageUrl={PINK}
        imageScale={280}
        imageX={0}
        imageY={0}
        previewScale={1}
        imageEdgeFade
        imageEdgeFadeAmount={16}
        objectFit="contain"
        showPlaceholder={false}
        className="h-full w-[220px]"
        onImageDrag={() => undefined}
      />
    </div>,
  );
  const stage = screen.getByTestId("fade-overflow").element();
  if (!(stage instanceof HTMLElement)) throw new Error("舞台必须是 HTML 元素");
  const wrap = stage.querySelector("[data-cover-el='operator']");
  if (!(wrap instanceof HTMLElement)) throw new Error("立绘盒必须在");
  const img = wrap.querySelector("img");
  if (!(img instanceof HTMLImageElement)) throw new Error("立绘图必须在");
  await expect.poll(() => img.complete && img.naturalWidth > 0).toBe(true);
  await expect.poll(() => wrap.querySelector("[data-ignore-export]") === null).toBe(true);
  expect(wrap.getBoundingClientRect().width).toBeLessThan(240);

  const { width, height, at } = await sample(stage);
  const pastBox = at(Math.floor(width * 0.48), Math.floor(height / 2));
  expect(pastBox[0]).toBeGreaterThan(180);
  expect(pastBox[1]).toBeLessThan(140);
});

test("左侧虚化只软左边，右侧仍实", async () => {
  const screen = await render(
    <div data-testid="fade-left" style={{ width: 400, height: 400, background: "#00c853" }}>
      <OperatorLayer
        imageUrl={PINK}
        imageScale={100}
        imageX={0}
        imageY={0}
        previewScale={1}
        imageEdgeFade
        imageEdgeFadeAmount={16}
        imageEdgeFadeMode="left"
        objectFit="cover"
        framed
        showPlaceholder={false}
        className="h-full w-full"
        onImageDrag={() => undefined}
      />
    </div>,
  );
  const stage = screen.getByTestId("fade-left").element();
  if (!(stage instanceof HTMLElement)) throw new Error("舞台必须是 HTML 元素");
  const wrap = stage.querySelector("[data-cover-el='operator']");
  if (!(wrap instanceof HTMLElement)) throw new Error("立绘盒必须在");
  const img = wrap.querySelector("img");
  if (!(img instanceof HTMLImageElement)) throw new Error("立绘图必须在");
  await expect.poll(() => img.complete && img.naturalWidth > 0).toBe(true);
  expect(wrap.dataset.edgeFadeMode).toBe("left");
  expect(wrap.querySelector("[data-edge-fade-y]")).toBeNull();

  const { width, height, at } = await sample(stage);
  const left = at(6, Math.floor(height / 2));
  const right = at(Math.floor(width * 0.82), Math.floor(height / 2));
  expect(left[1]).toBeGreaterThan(right[1]);
  expect(right[0]).toBeGreaterThan(180);
});

test("右侧虚化只软右边，左侧仍实", async () => {
  const screen = await render(
    <div data-testid="fade-right" style={{ width: 400, height: 400, background: "#00c853" }}>
      <OperatorLayer
        imageUrl={PINK}
        imageScale={100}
        imageX={0}
        imageY={0}
        previewScale={1}
        imageEdgeFade
        imageEdgeFadeAmount={16}
        imageEdgeFadeMode="right"
        objectFit="cover"
        framed
        showPlaceholder={false}
        className="h-full w-full"
        onImageDrag={() => undefined}
      />
    </div>,
  );
  const stage = screen.getByTestId("fade-right").element();
  if (!(stage instanceof HTMLElement)) throw new Error("舞台必须是 HTML 元素");
  const wrap = stage.querySelector("[data-cover-el='operator']");
  if (!(wrap instanceof HTMLElement)) throw new Error("立绘盒必须在");
  const img = wrap.querySelector("img");
  if (!(img instanceof HTMLImageElement)) throw new Error("立绘图必须在");
  await expect.poll(() => img.complete && img.naturalWidth > 0).toBe(true);
  expect(wrap.dataset.edgeFadeMode).toBe("right");
  expect(wrap.querySelector("[data-edge-fade-y]")).toBeNull();

  const { width, height, at } = await sample(stage);
  const left = at(Math.floor(width * 0.18), Math.floor(height / 2));
  const right = at(width - 6, Math.floor(height / 2));
  expect(right[1]).toBeGreaterThan(left[1]);
  expect(left[0]).toBeGreaterThan(180);
});
