import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script"; // Подключили инструмент безопасного внедрения скриптов аналитики
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" });

// ГЛАВНЫЙ БЛОК ДЛЯ SEO ОМСКА
export const metadata: Metadata = {
  title: "Остекление и отделка балконов в Омске | Цены под ключ",
  description: "Профессиональное остекление, утепление и отделка балконов в Омске. Гарантия качества, низкие цены и работа под ключ. Бесплатный замер!",
  keywords: ["остекление балконов омск", "отделка балконов омск", "балкон под ключ омск"],
  // ИСПРАВЛЕНО: Добавлен канонический URL для главной страницы (решает проблему из отчета SiteAnalyzer)
  alternates: {
    canonical: "https://balkonreshenie.ru",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        {children}

        {/* ИСПРАВЛЕНО: Внедрен асинхронный счетчик Яндекс.Метрики без ущерба для скорости PageSpeed */}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < e.length; j++) {if (e[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(99999999, "init", {
                 clickmap:true,
                 trackLinks:true,
                 accurateTrackBounce:true,
                 webvisor:true
            });
          `}
        </Script>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/99999999" style={{ position: 'absolute', left: '-9999px' }} alt="" />
          </div>
        </noscript>
      </body>
    </html>
  );
}