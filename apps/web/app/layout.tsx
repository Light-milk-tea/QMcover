import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "封面喵",
  description: "模板 + AI + 深度编辑的一体化智能封面制作产品"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
