import type { Metadata } from "next";
import Script from "next/script"; 
import "./globals.css";

// ГЛАВНЫЙ БЛОК ДЛЯ SEO ОМСКА
export const metadata: Metadata = {
  title: "Остекление и отделка балконов в Омске | Цены под ключ",
  description: "Профессиональное остекление, утепление и отделка балконов в Омске. Гарантия качества, низкие цены и работа под ключ. Бесплатный замер!",
  keywords: ["остекление балконов омск", "отделка балконов омск", "балкон под ключ омск"],
  alternates: {
    canonical: "https://balkonreshenie.ru",
  },
  verification: {
    yandex: "2b079a9c18aa7b96", 
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* Безопасное подключение шрифта напрямую в браузере */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}

        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < e.length; j++) {if (e[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(110101263, "init", {
                 clickmap:true,
                 trackLinks:true,
                 accurateTrackBounce:true,
                 webvisor:true
            });
          `}
        </Script>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/110101263" style={{ position: 'absolute', left: '-9999px' }} alt="" />
          </div>
        </noscript>
      </body>
    </html>
  );
}