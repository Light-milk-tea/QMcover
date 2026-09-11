import { useRef } from "react";
import { afterEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { CoverProvider } from "../store/CoverContext";
import { TopBar } from "./TopBar";

afterEach(() => {
  window.confirm = () => true;
});

function Bar({ onExport }: { onExport: () => Promise<void> }) {
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <CoverProvider templateId="solo">
      <TopBar onExport={onExport} onBack={() => undefined} stageRef={stageRef} onSavedTemplate={() => undefined} />
    </CoverProvider>
  );
}

test("导出失败后按钮恢复并可再点", async () => {
  window.confirm = () => true;
  const screen = await render(<Bar onExport={async () => { throw new Error("fail"); }} />);
  await screen.getByRole("button", { name: "导出封面" }).click();
  await expect.element(screen.getByText("导出失败")).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "导出封面" })).toBeEnabled();
});

test("导出超时会提示而不是一直转", async () => {
  window.confirm = () => true;
  const screen = await render(<Bar onExport={async () => { throw new Error("export-timeout"); }} />);
  await screen.getByRole("button", { name: "导出封面" }).click();
  await expect.element(screen.getByText("导出超时，请再试")).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "导出封面" })).toBeEnabled();
});

test("导出成功提示已下载", async () => {
  window.confirm = () => true;
  const screen = await render(<Bar onExport={async () => undefined} />);
  await screen.getByRole("button", { name: "导出封面" }).click();
  await expect.element(screen.getByText("已下载")).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "导出封面" })).toBeEnabled();
});
