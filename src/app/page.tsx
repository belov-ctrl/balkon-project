import HomeClientPage from '@/components/HomeClientPage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 1. Запрос данных для блоков главной страницы
async function getMainPageData() {
  try {
    // Используем официальный плоский точечный синтаксис Strapi v5.
    // Никаких '*' и вложенных скобок, что полностью решает проблему с ошибкой "heroBackground.related"
    const url = 'https://balkonreshenie.ru/api/main-page?populate[0]=heroBackground&populate[1]=aboutImage&populate[2]=glazingCard.img&populate[3]=StructureTab.img';
    
    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) {
      const errorDetails = await res.json().catch(() => ({}));
      console.error('🚨 [Strapi v5] Ошибка запроса главной страницы:', JSON.stringify(errorDetails, null, 2));
      return null;
    }

    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error('🚨 Критическая ошибка сети при запросе к Strapi (Main Page):', error);
    return null;
  }
}

// 2. Запрос списка живых статей из админки
async function getArticlesData() {
  try {
    // Тянем статьи, сортируем их по дате публикации (свежие выше) и подгружаем медиа-обложку (cover)
    const url = 'https://balkonreshenie.ru/api/articles?populate[0]=cover&sort[0]=publishedAt:desc';
    
    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) {
      const errorDetails = await res.json().catch(() => ({}));
      console.error('🚨 [Strapi v5] Ошибка запроса статей:', JSON.stringify(errorDetails, null, 2));
      return null;
    }

    const json = await res.json();
    console.log('🎉 Статьи из блога успешно подгружены из Strapi v5!');
    return json.data || null;
  } catch (error) {
    console.error('🚨 Критическая ошибка сети при запросе статей к Strapi:', error);
    return null;
  }
}

export default async function Page() {
  // Запускаем оба процесса параллельно для максимальной скорости работы
  const [mainData, articlesData] = await Promise.all([
    getMainPageData(),
    getArticlesData()
  ]);

  // Передаем оба массива данных в клиентский UI-компонент
  return <HomeClientPage initialData={mainData} articlesData={articlesData} />;
}