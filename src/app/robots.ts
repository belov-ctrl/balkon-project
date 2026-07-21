import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Страница «Прямой балкон» полностью готова — открываем явно
        // (правило длиннее /services/ → имеет приоритет у Google и Яндекса)
        userAgent: '*',
        allow: ['/services/pryamoy-balkon'],
        disallow: ['/services/'],
      },
    ],
    sitemap: 'https://balkonreshenie.ru/sitemap.xml',
  };
}
