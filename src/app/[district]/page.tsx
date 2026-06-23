import { Metadata } from 'next';
import HomeClientPage from '@/components/HomeClientPage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ИСПРАВЛЕНО: Добавлены перекрестные алиасы (-j- и -th-, kuj и kuy) для 100% совпадения с роутером и футером
const russianGeoMap: Record<string, { landing: string }> = {
  // --- КОЛОНКА 1 ---
  'bolshaya-ostrovka': { landing: 'в Большой Островке' },
  '11-j-mikrorajon': { landing: 'в 11-м микрорайоне' },
  'amurskij': { landing: 'в Амурском посёлке' },
  'pribrezhnyj': { landing: 'в Прибрежном' },
  'kosmos': { landing: 'в Космосе' },
  '3-j-mikrorajon': { landing: 'в 3-м микрорайоне' },
  'amurskij-2': { landing: 'в Амуре-2' },
  'pervokirpichnyj': { landing: 'в Первокирпичном' },
  'gorodok-neftyanikov': { landing: 'в Городке Нефтяников' },
  'port-artur': { landing: 'в Порт-Артурe' },
  'solnechnyj': { landing: 'в Солнечном' },
  'ryabinovka': { landing: 'в Рябиновке' },
  'linejnyj': { landing: 'в Линейном' },
  'zelyonaya-dolina': { landing: 'в Зелёной долине' },
  'nikolaevka': { landing: 'в Николаевке' },
  'novaya-stanica': { landing: 'в Новой Станице' },

  // --- КОЛОНКА 2 ---
  'kujbyshevskij': { landing: 'в Куйбышевском районе' },
  'kuybyshevskij': { landing: 'в Куйбышевском районе' }, // Алиас
  'topolinyj': { landing: 'в Тополином' },
  '5-j-mikrorajon': { landing: 'в 5-м микрорайоне' },
  '5-th-mikrorajon': { landing: 'в 5-м микрорайоне' }, // Алиас
  'levoberezhye': { landing: 'на Левом берегу' },
  'privokzalnyj': { landing: 'в Привокзальном' },
  'komsomolskij-gorodok': { landing: 'в Комсомольском городке' },
  '4-j-mikrorajon': { landing: 'в 4-м микрорайоне' },
  '4-th-mikrorajon': { landing: 'в 4-м микрорайоне' }, // Алиас
  'parkovyj-mikrorajon': { landing: 'в Парковом микрорайоне' },
  'zaozyornyj': { landing: 'в Заозёрном' },
  'zahlamino': { landing: 'в Захламино' },
  'moskovka': { landing: 'на Московке' },
  'volzhskij': { landing: 'в Волжском' },
  'karyer': { landing: 'в Карьере' },
  'yasnaya-polyana': { landing: 'в Ясной Поляне' },
  'severnyj': { landing: 'в Северном' },
  'aleksandrovskaya-usadba': { landing: 'в Александровской усадьбе' },

  // --- КОЛОНКА 3 ---
  'gorodok-vodnikov': { landing: 'в Городке Водников' },
  '12-j-mikrorajon': { landing: 'в 12-м микрорайоне' },
  'polyot': { landing: 'в Полёте' },
  '6-j-mikrorajon': { landing: 'в 6-м микрорайоне' },
  '6-th-mikrorajon': { landing: 'в 6-м микрорайоне' }, // Алиас
  'kirovsk': { landing: 'в Кировске' },
  'leninsk': { landing: 'в Ленинске' },
  'chkalovskij': { landing: 'в Чкаловском посёлке' },
  '2-j-mikrorajon': { landing: 'во 2-м микрорайоне' },
  'staryj-kirovsk': { landing: 'в Старом Кировске' },
  'bolshie-polya': { landing: 'в Больших Полях' },
  'yubilejnyj': { landing: 'в Юбилейном' },
  'bulatovo': { landing: 'в Булатово' },
  'zagorodnyj': { landing: 'в Загородном' },
  'vhodnoj': { landing: 'в микрорайоне Входной' },
  'mikrorajon-vhodnoj': { landing: 'в микрорайоне Входной' },
  'cheryomushki': { landing: 'в Черёмушках' },
  'beregovoj': { landing: 'в Береговом' },

  // --- КОЛОНКА 4 ---
  'rybachij': { landing: 'в Рыбачьем' },
  'omskij-kristall': { landing: 'в Омском Кристалле' },
  'biofabrika': { landing: 'на Биофабрике' },
  'aviagorodok': { landing: 'в Авиагородке' },
  'kordnyj': { landing: 'в Кордном' },
  '1-j-mikrorajon': { landing: 'в 1-м микрорайоне' },
  'chukreevka': { landing: 'в Чукреевке' },
  'vostochnyj': { landing: 'в Восточном' },
  'cheredovyj': { landing: 'в Чередовом' },
  'stepnoj': { landing: 'в Степном' },
  'dalnij': { landing: 'в Дальнем' },
  'armejskij': { landing: 'в Армейском' },
  'ostashkovo': { landing: 'в Осташково' },
  'svetlyj': { landing: 'в Светлом' },
  'cheryomuhovskoe': { landing: 'в Черёмуховском' },
  'krutaya-gorka': { landing: 'в Крутой Горке' },
  
  // Дополнительные алиасы
  'levyj-bereg': { landing: 'на Левом берегу' },
  'neftyaniki': { landing: 'в Нефтяниках' },
  'amur': { landing: 'в Амурском посёлке' },
  'moskovka-2': { landing: 'на Московке-2' }
};

interface Props {
  params: any;
}

async function getCleanDistrict(params: any): Promise<string> {
  const resolved = await params;
  const raw = resolved?.district || resolved?.slug || '';
  return String(raw).toLowerCase().trim();
}

// Запрос списка живых статей из Strapi для вывода внизу контента
async function getArticlesData() {
  try {
    const url = 'https://balkonreshenie.ru/api/articles?populate[0]=cover&sort[0]=publishedAt:desc';
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error('🚨 Ошибка сети при запросе статей на странице района:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const district = await getCleanDistrict(params);
  const geo = russianGeoMap[district] || { landing: 'в вашем районе' };

  try {
    const res = await fetch(`https://balkonreshenie.ru/api/pages?filters[slug][$eq]=${district}`, { cache: 'no-store' });
    const json = await res.json();
    const pageData = json.data?.[0] || {};

    return {
      title: pageData.seo_title || `Остекление балконов ${geo.landing} Омск — Цены завода`,
      description: pageData.seo_description || `Профессиональное остекление, комплексное утепление и отделка балконов ${geo.landing} в Омске. Гарантия 5 лет!`,
      // ИСПРАВЛЕНО: Добавлен канонический адрес для устранения дублей на страницах районов
      alternates: {
        canonical: `https://balkonreshenie.ru/${district}`,
      }
    };
  } catch (error) {
    return {
      title: `Остекление балконов ${geo.landing} Омск — Цены завода`,
      description: `Профессиональное остекление и отделка балконов ${geo.landing} в Омске.`,
      alternates: {
        canonical: `https://balkonreshenie.ru/${district}`,
      }
    };
  }
}

export default async function DistrictPage({ params }: Props) {
  const district = await getCleanDistrict(params);
  const geo = russianGeoMap[district] || { landing: 'в вашем районе' };

  let mergedData = {};
  let articlesData: any[] = [];

  try {
    const mainUrl = 'https://balkonreshenie.ru/api/main-page?populate[0]=heroBackground&populate[1]=aboutImage&populate[2]=glazingCard.img&populate[3]=StructureTab.img';
    const distUrl = `https://balkonreshenie.ru/api/pages?filters[slug][$eq]=${district}&populate[0]=heroBackground`;
    
    const [mainRes, distRes, fetchedArticles] = await Promise.all([
      fetch(mainUrl, { cache: 'no-store' }),
      fetch(distUrl, { cache: 'no-store' }),
      getArticlesData()
    ]);

    const mainJson = await mainRes.json();
    const distJson = await distRes.json();
    
    const mainData = mainJson.data || {};
    const pageData = distJson.data?.[0] || {};
    
    if (fetchedArticles) {
      articlesData = fetchedArticles;
    }

    const finalRussianGeo = pageData.landingName || geo.landing;

    mergedData = {
      ...mainData,
      heroBadge: `📍 Профессиональный монтаж окон ${finalRussianGeo}`,
      heroTitle: pageData.heroTitle || mainData.heroTitle || `Остекление и отделка балконов под ключ`,
      heroTitleHighlight: pageData.heroTitleHighlight || mainData.heroTitleHighlight || finalRussianGeo,
      heroDesc: pageData.heroDesc || `Качественные оконные системы и благоустройство лоджий ${finalRussianGeo} напрямую от завода. Бесплатный выезд замерщика сегодня. Гарантия 5 лет!`,
      heroBackground: pageData.heroBackground || mainData.heroBackground,
      seoText: pageData.seoText || mainData.seoText
    };

  } catch (error) {
    console.error(`🚨 Сбой склейки страниц для коллекции pages [${district}]:`, error);
  }

  return <HomeClientPage initialData={mergedData} articlesData={articlesData} />;
}