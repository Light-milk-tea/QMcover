import { useRef } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { writePersisted } from "../lib/persist";
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

test("草稿存不进浏览器时顶栏提示，存上之后提示消失", async () => {
  const screen = await render(<Bar onExport={async () => undefined} />);
  const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("full", "QuotaExceededError");
  });
  writePersisted("qmcover-topbar-test", { title: "a" });
  await expect.element(screen.getByRole("alert")).toHaveTextContent("草稿没存上");
  setItem.mockRestore();
  writePersisted("qmcover-topbar-test", { title: "b" });
  await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();
});

test("导出成功提示已下载", async () => {
  window.confirm = () => true;
  const screen = await render(<Bar onExport={async () => undefined} />);
  await screen.getByRole("button", { name: "导出封面" }).click();
  await expect.element(screen.getByText("已下载")).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "导出封面" })).toBeEnabled();
});
