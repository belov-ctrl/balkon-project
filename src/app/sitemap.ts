import { MetadataRoute } from 'next';

// 1. Указываем реальный боевой домен компании для индексации в Яндексе и Google
const BASE_URL = 'https://balkonreshenie.ru'; 

// 2. Наш чётко синхронизированный список 64 районов Омска (без 404 ошибок)
const districtsSlugs = [
  'bolshaya-ostrovka', '11-j-mikrorajon', 'amurskij', 'pribrezhnyj', 'kosmos', 
  '3-j-mikrorajon', 'amurskij-2', 'pervokirpichnyj', 'gorodok-neftyanikov', 'port-artur', 
  'solnechnyj', 'ryabinovka', 'linejnyj', 'zelyonaya-dolina', 'nikolaevka', 'novaya-stanica',
  'kuybyshevskij', 'topolinyj', '5-th-mikrorajon', 'levoberezhye', 'privokzalnyj', 
  'komsomolskij-gorodok', '4-th-mikrorajon', 'parkovyj-mikrorajon', 'zaozyornyj', 'zahlamino', 
  'moskovka', 'volzhskij', 'karyer', 'yasnaya-polyana', 'severnyj', 'aleksandrovskaya-usadba',
  'gorodok-vodnikov', '12-j-mikrorajon', 'polyot', '6-th-mikrorajon', 'kirovsk', 
  'staryj-kirovsk', 'leninsk', 'chkalovskij', '2-j-mikrorajon', 'bolshie-polya', 
  'yubilejnyj', 'bulatovo', 'zagorodnyj', 'vhodnoj', 'cheryomushki', 'beregovoj',
  'rybachij', 'omskij-kristall', 'biofabrika', 'aviagorodok', 'kordnyj', 
  '1-j-mikrorajon', 'chukreevka', 'vostochnyj', 'cheredovyj', 'stepnoj', 
  'dalnij', 'armejskij', 'ostashkovo', 'svetlyj', 'cheryomuhovskoe', 'krutaya-gorka'
];

// 3. Безопасный автоматический сбор адресов статей из Strapi v5
async function getBlogSlugs() {
  try {
    const res = await fetch('https://balkonreshenie.ru/api/articles?fields[0]=slug', {
      next: { revalidate: 3600 } // Обновляем кэш карты раз в час, чтобы беречь процессор 1 CPU
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.map((item: any) => item.attributes?.slug || item.slug) || [];
  } catch (error) {
    console.error('Ошибка сбора слагов блога для карты сайта:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Главные статические разделы
  const mainRoutes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }
  ];

  // Страницы 64 гео-локаций Омска
  const districtRoutes = districtsSlugs.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Динамические страницы статей блога
  const blogSlugs = await getBlogSlugs();
  const blogRoutes = blogSlugs.map((slug: string) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Объединяем всё в финальную карту сайта
  return [...mainRoutes, ...districtRoutes, ...blogRoutes];
}