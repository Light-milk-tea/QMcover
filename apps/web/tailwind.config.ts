import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F5F3FF",
          500: "#8B5CF6",
          700: "#6D28D9"
        }
      }
    }
  },
  plugins: []
};

export default config;
