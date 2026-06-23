import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" });

// ГЛАВНЫЙ БЛОК ДЛЯ SEO ОМСКА
export const metadata: Metadata = {
  title: "Остекление и отделка балконов в Омске | Цены под ключ",
  description: "Профессиональное остекление, утепление и отделка балконов в Омске. Гарантия качества, низкие цены и работа под ключ. Бесплатный замер!",
  keywords: ["остекление балконов омск", "отделка балконов омск", "балкон под ключ омск"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  );
}