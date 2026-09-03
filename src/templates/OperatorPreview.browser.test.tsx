import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { emptyDraft, loadDraft, saveState } from "../lib/storage";
import { OperatorPreview } from "./OperatorPreview";

beforeEach(() => {
  localStorage.clear();
});

test("干员前瞻模板显示主信息并保留可编辑图层", async () => {
  const screen = await render(
    <div style={{ width: 1920, height: 1080 }}>
      <OperatorPreview
        title="强度预测"
        subtitle="技能解析"
        signature="OPERATOR"
        mark="OPERATOR INTEL"
        episode={1}
        date="2026-09-03"
        operatorName=""
        imageUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='48'%3E%3Crect width='32' height='48' fill='%234b6b82'/%3E%3C/svg%3E"
        imageScale={168}
        imageX={0}
        imageY={0}
        previewScale={1}
        onImageDrag={() => undefined}
        showPlaceholder={false}
        bgPreset="ink"
      />
    </div>,
  );

  await expect.element(screen.getByText("技能解析", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("前瞻分析", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("#1", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("ANALYSIS", { exact: true })).toBeVisible();

  const title = screen.container.querySelector('[data-cover-el="title"]');
  const operator = screen.container.querySelector('[data-cover-el="operator"]');
  const badgeBackground = screen.container.querySelector('[data-cover-el="badge-bg"]');
  expect(title?.textContent).toContain("强度预测");
  expect(operator).not.toBeNull();
  expect(badgeBackground).not.toBeNull();
});

test("旧版默认稿迁移到最新人物和布局", () => {
  const old = {
    ...emptyDraft("operator-preview"),
    title: "保留我的标题",
    operatorName: "流明",
    operatorId: "char_4042_lumen",
    artId: "char_4042_lumen_1",
    imageScale: 350,
    imageX: -155,
    imageY: 600,
    episode: 6,
  };
  saveState({ drafts: { "operator-preview": old }, defaultsVersion: 6 });

  const migrated = loadDraft("operator-preview");
  expect(migrated.title).toBe("保留我的标题");
  expect(migrated.operatorId).toBe("char_213_mostma");
  expect(migrated.artId).toBe("char_213_mostma_1");
  expect(migrated.imageScale).toBe(215);
  expect(migrated.imageX).toBe(88.27180196029154);
  expect(migrated.imageY).toBe(341.6520482533292);
  expect(migrated.episode).toBe(1);
  expect(migrated.effects.bgGrade.grayscale).toBe(24);
  expect(migrated.effects.bgGrade.brightness).toBe(80);
  expect(migrated.layers.some((layer) => layer.id === "analysis")).toBe(true);
});
