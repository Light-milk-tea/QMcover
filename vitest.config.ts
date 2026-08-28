import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    include: ["src/**/*.browser.test.{ts,tsx}"],
    browser: {
      enabled: true,
      headless: true,
      viewport: { width: 1280, height: 800 },
      provider: playwright({
        launchOptions: { headless: true },
      }),
      instances: [{ browser: "chromium" }],
    },
  },
});
