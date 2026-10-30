import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import HomeClientPage from '@/components/HomeClientPage';
import { getDeterministicImage, HeroImageType } from '@/lib/heroImage';

// Конвертирует plain-text (абзацы через \n\n) в массив Strapi-блоков для BlocksRenderer
function textToStrapiBlocks(text: string) {
  if (!text) return [];
  return text
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: 'paragraph' as const,
      children: [{ type: 'text' as const, text: paragraph }],
    }));
}

// ISR: страницы кэшируются на 5 минут, затем регенерируются в фоне при следующем запросе
export const revalidate = 300;

const STRAPI_BASE = 'https://balkonreshenie.ru';

// =========================================================================
// ТИПЫ И ФОЛЛБЭК-СЛОВАРЬ (все слаги навигации и карточек)
// =========================================================================

interface GlazingCard {
  title: string;
  price: string;
  desc: string;
  img: string;
  badge: string;
  alt?: string;
}

interface StructureTab {
  tabName: string;
  title: string;
  desc: string;
  features: string[];
  img: string;
}

interface ServiceFallback {
  slug: string;
  name: string;
  seoDescription: string;
  heroBadge: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroDesc: string;
  heroBackground: string;
  topCard1Title: string;
  topCard1Subtitle: string;
  topCard1Price: string;
  topCard2Title: string;
  topCard2Desc: string;
  aboutBadge: string;
  aboutTitle: string;
  aboutImage: string;
  glazingCard: GlazingCard[];
  StructureTab: StructureTab[];
  seoText?: string;
}

interface FallbackSeed {
  slug: string;
  name: string;
  seoDescription: string;
  heroBadge: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroDesc: string;
  topCard1Title: string;
  topCard1Subtitle: string;
  aboutTitle: string;
  basePrice: number;
  packagePrice: string;
  heroBackground?: string;
  aboutImage?: string;
}

const DEFAULT_ABOUT_IMG = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/okonnye-sistemy-kbe-ehtalon-na-balkone-750x750.jpg';

// ── Тип hero-изображения по слагу услуги ────────────────────────────────────
const SERVICE_IMAGE_TYPES: Record<string, HeroImageType> = {
  // interiors — отделка, утепление, мебель, панорамное/безрамное/французское
  'lodzhiya-3-metra':              'interiors',
  'lodzhiya-6-metrov':             'interiors',
  'francuzskie-okna':              'interiors',
  'francuzskoe-osteklenie':        'interiors',
  'razdvizhnye-sistemy':           'interiors',
  'bezramnoe-osteklenie':          'interiors',
  'kompleksnoe-uteplenie':         'interiors',
  'uteplenie-penopleksom':         'interiors',
  'uteplenie-penofolom':           'interiors',
  'zimnee-sovmeshchenie-s-komnatoy': 'interiors',
  'vnutrennyaya-otdelka':          'interiors',
  'otdelka-pvh-panelyami':         'interiors',
  'ukladka-pola-i-laminata':       'interiors',
  'vstroennaya-mebel-i-shkafy':    'interiors',
  'panoramnoe-osteklenie':         'interiors',
  'obshivka-evrovagonkoy':         'interiors',
  'balkony-pod-klyuch':            'interiors',
  'erkernyj-balkon':               'interiors',
  // production — классические ПВХ-окна, холодное/тёплое остекление от завода
  'balkonnye-bloki':               'production',
  'okna-plastikovye':              'production',
  'teploe-osteklenie-pvh':         'production',
  'holodnoe-osteklenie-al':        'production',
  // cottage — коттеджи и загородные дома
  'osteklenie-v-kottedzhe':        'cottage',
  // exteriors — хрущёвки, сталинки, новостройки, выносы (default)
};
// Базовые карточки цен — реальные фото выполненных работ по балконам в Омске
const CARD_IMG_A = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/teploe-osteklenie-balkona-veka-evrolajn-300x300.jpg'; // Тёплое ПВХ остекление Века Евролайн
const CARD_IMG_B = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/kholodnoe-osteklenie-balkona-provedal-300x300.jpg'; // Холодное алюминиевое остекление Provedal
const CARD_IMG_C = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/osteklenie-i-otdelka-balkona-300x300.jpg'; // Остекление и отделка балкона под ключ
const CARD_IMG_D = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/teplaya-plastikovaya-lodzhiya-pod-klyuch-300x300.jpg'; // Тёплая пластиковая лоджия под ключ
// Табы конфигураций — реальные фото балконов разных типов
const TAB_IMG_A = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/zamena-kholodnogo-ostekleniya-v-novostrojke-750x750.jpg'; // Прямой балкон — остекление в новостройке
const TAB_IMG_B = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/balkon-s-rasshireniem-i-oknami-rekhau-delajt-750x750.jpg'; // Угловой/Г-образный балкон с расширением
const TAB_IMG_C = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/razdvizhnoe-kholodnoe-zasteklenie-na-lodzhii-1-300x300.jpg'; // Лоджия 6 м — раздвижное остекление
// Тематические константы для специфических групп услуг
const IMG_PANORAMA   = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/panoramnoe-osteklenie-balkona-s-otdelkoj-300x300.jpg'; // Панорамное остекление балкона с отделкой
const IMG_WARM_LIVING = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/okna-v-pol-veka-na-teplom-balkone-750x750.jpg'; // Окна в пол Века — тёплый балкон
const IMG_WOOD_DECK  = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/montazh-dekening-na-balkone-9-metrov-750x750.jpg'; // Декинг (настил) на балконе 9 метров
const IMG_INSULATION = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/05/uteplenie-balkonov-i-lodzhij.jpg'; // Утепление балконов и лоджий
const IMG_INTERIOR   = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/05/vnutrennyaya-otdelka-balkona.png'; // Внутренняя отделка балкона
const IMG_METAL_ROOF = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/osteklenie-balkona-s-kryshej-300x300.jpg'; // Остекление балкона с крышей из профлиста
const IMG_FACADE_EXT = 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/alyuminievye-balkonnye-ramy-s-naruzhnoj-otdelkoj-750x750.jpg'; // Алюминиевые рамы с наружной отделкой

function formatPrice(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function makeGlazingCards(name: string, basePrice: number): GlazingCard[] {
  const p1 = formatPrice(basePrice);
  const p2 = formatPrice(basePrice + 500);
  const p3 = formatPrice(basePrice + 900);
  const p4 = formatPrice(basePrice + 1400);
  return [
    {
      title: `${name} — стандарт`,
      price: p1,
      desc: `Базовый комплект «${name}» с материалами от завода-производителя в Омске. Монтаж за 1 день, гарантия 5 лет.`,
      img: CARD_IMG_A,
      badge: 'Популярно',
    },
    {
      title: `${name} — комфорт`,
      price: p2,
      desc: `Улучшенные материалы, усиленная герметизация швов и расширенная комплектация фурнитуры.`,
      img: CARD_IMG_B,
      badge: 'Оптимально',
    },
    {
      title: `${name} — премиум`,
      price: p3,
      desc: `Максимальная комплектация с энергосберегающими опциями и индивидуальным подбором профиля.`,
      img: CARD_IMG_C,
      badge: 'Премиум',
    },
    {
      title: `${name} под ключ`,
      price: p4,
      desc: `Полный цикл работ: замер, изготовление, монтаж, уборка. Фиксированная смета в договоре.`,
      img: CARD_IMG_D,
      badge: 'Под ключ',
    },
  ];
}

function makeStructureTabs(name: string): StructureTab[] {
  return [
    {
      tabName: 'Прямой балкон',
      title: `${name} на прямом балконе`,
      desc: `Классическая схема для панельных домов Омска: фронтальная часть с учётом особенностей «${name}». Боковые стены закрываются панелями или глухими створками.`,
      features: [
        'Бесплатный выезд замерщика в день обращения',
        'Монтаж по ГОСТ с пароизоляционными лентами',
        'Уборка и вывоз строительного мусора после работ',
      ],
      img: TAB_IMG_A,
    },
    {
      tabName: 'Угловой балкон',
      title: `${name} на Г-образном балконе`,
      desc: `Две стеклянные или отделочные секции с надёжным угловым соединением. Популярно в хрущёвках и брежневках Омска.`,
      features: [
        'Угловой профиль без мостиков холода',
        'Индивидуальный расчёт нагрузки на плиту',
        'Согласование с управляющей компанией при необходимости',
      ],
      img: TAB_IMG_B,
    },
    {
      tabName: 'Лоджия 6 метров',
      title: `${name} на длинной лоджии 6 м`,
      desc: `Разделение длинного пролёта на несколько секций для удобства эксплуатации. Усиленный профиль для больших конструкций.`,
      features: [
        'Распределение нагрузки на несколько створок',
        'Микропроветривание на каждой секции',
        'Срок монтажа — 1–2 рабочих дня',
      ],
      img: TAB_IMG_C,
    },
  ];
}

function seedToFallback(seed: FallbackSeed): ServiceFallback {
  const imageType: HeroImageType = SERVICE_IMAGE_TYPES[seed.slug] ?? 'exteriors';
  return {
    slug: seed.slug,
    name: seed.name,
    seoDescription: seed.seoDescription,
    heroBadge: seed.heroBadge,
    heroTitle: seed.heroTitle,
    heroTitleHighlight: seed.heroTitleHighlight,
    heroDesc: seed.heroDesc,
    heroBackground: seed.heroBackground || getDeterministicImage(seed.slug, imageType),
    topCard1Title: seed.topCard1Title,
    topCard1Subtitle: seed.topCard1Subtitle,
    topCard1Price: seed.packagePrice,
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На материалы и монтаж',
    aboutBadge: 'Завод в Омске',
    aboutTitle: seed.aboutTitle,
    aboutImage: seed.aboutImage || DEFAULT_ABOUT_IMG,
    glazingCard: makeGlazingCards(seed.name, seed.basePrice),
    StructureTab: makeStructureTabs(seed.name),
  };
}

const EXTRA_SERVICE_SEEDS: FallbackSeed[] = [
  {
    slug: 'pryamoy-balkon',
    name: 'Прямой балкон',
    seoDescription: 'Остекление и отделка прямого балкона в Омске от завода «Балконные Решения». Тёплое и холодное остекление, монтаж за 1 день. Бесплатный замер — +7 (908) 106-83-52!',
    heroBadge: '🏠 Классическая планировка — самый частый запрос в Омске',
    heroTitle: 'Прямой балкон',
    heroTitleHighlight: 'остекление и отделка в Омске',
    heroDesc: 'Остекляем фронтальную часть прямого балкона с закрытием боковых стен сэндwich-панелями. Работаем с панельными и кирпичными домами всех серий.',
    topCard1Title: 'Остекление прямого балкона 3 м',
    topCard1Subtitle: 'ПВХ или алюминий + монтаж',
    basePrice: 3200,
    packagePrice: 'от 36 000 руб',
    aboutTitle: 'Прямой балкон — проверенное решение для омских панелек',
  },
  {
    slug: 'g-obraznyj-balkon',
    name: 'Г-образный балкон',
    seoDescription: 'Г-образное остекление балконов в Омске: фронтальная и боковая секции, больше света и обзора. Заводские цены, гарантия 5 лет. Звоните для бесплатного замера!',
    heroBadge: '📐 Угловая планировка — больше света в комнате',
    heroTitle: 'Г-образный балкон',
    heroTitleHighlight: 'остекление под ключ в Омске',
    heroDesc: 'Две стеклянные секции: широкая фронтальная и боковая часть. Идеально для угловых квартир в хрущёвках и новостройках Омска.',
    topCard1Title: 'Г-образное остекление',
    topCard1Subtitle: '2 секции + угловой профиль',
    basePrice: 3400,
    packagePrice: 'от 42 000 руб',
    aboutTitle: 'Г-образный балкон — максимум обзора без лишней нагрузки',
  },
  {
    slug: 'p-obraznyj-balkon',
    name: 'П-образный балкон',
    seoDescription: 'П-образное трёхстороннее остекление балконов в Омске с обязательным усилением плиты. Панорамный обзор на 180°. Цены от завода, гарантия 5 лет!',
    heroBadge: '🌅 Трёхсторонний обзор — премиум-планировка',
    heroTitle: 'П-образный балкон',
    heroTitleHighlight: 'трёхстороннее остекление в Омске',
    heroDesc: 'Остекление с трёх сторон: центральная и две боковые секции. Перед монтажом проводим обследование плиты и при необходимости усиливаем основание.',
    topCard1Title: 'П-образное остекление',
    topCard1Subtitle: '3 секции + усиление плиты',
    basePrice: 3800,
    packagePrice: 'от 58 000 руб',
    aboutTitle: 'П-образный балкон — панорама с инженерным подходом',
  },
  {
    slug: 'erkernyj-balkon',
    name: 'Эркерный балкон',
    seoDescription: 'Остекление эркерных балконов в Омске: нестандартная геометрия, индивидуальный проект и точный замер. Завод-производитель, монтаж за 1–2 дня!',
    heroBadge: '✨ Эркер — нестандартная форма требует точного проекта',
    heroTitle: 'Эркерный балкон',
    heroTitleHighlight: 'остекление в Омске',
    heroDesc: 'Изготавливаем конструкции по индивидуальным размерам для эркерных выступов. Учитываем каждый угол и радиус скругления фасада.',
    topCard1Title: 'Остекление эркера',
    topCard1Subtitle: 'Индивидуальный проект + монтаж',
    basePrice: 4100,
    packagePrice: 'от 48 000 руб',
    aboutTitle: 'Эркерный балкон — точность замера решает всё',
  },
  {
    slug: 'lodzhiya-3-metra',
    name: 'Лоджия 3 метра',
    seoDescription: 'Остекление и отделка 3-метровой лоджии в Омске под ключ. ПВХ, алюминий, утепление, отделка. Цены от завода от 3 200 ₽/м². Бесплатный замер!',
    heroBadge: '📏 Стандартная 3-метровая лоджия — хит продаж',
    heroTitle: 'Лоджия 3 метра',
    heroTitleHighlight: 'остекление и отделка в Омске',
    heroDesc: 'Типовая лоджия в панельных домах Омска: тёплое или холодное остекление, утепление, внутренняя отделка. Монтаж за один рабочий день.',
    topCard1Title: 'Лоджия 3 м под ключ',
    topCard1Subtitle: 'Остекление + отделка',
    basePrice: 3200,
    packagePrice: 'от 38 400 руб',
    aboutTitle: 'Лоджия 3 метра — оптимальный баланс цены и качества',
  },
  {
    slug: 'lodzhiya-6-metrov',
    name: 'Лоджия 6 метров',
    seoDescription: 'Остекление длинной 6-метровой лоджии в Омске с усиленным профилем. Разделение на секции, тёплое и холодное остекление. Завод «Балконные Решения»!',
    heroBadge: '📐 Длинный пролёт — усиленный профиль и несколько створок',
    heroTitle: 'Лоджия 6 метров',
    heroTitleHighlight: 'остекление под ключ в Омске',
    heroDesc: 'Длинная лоджия делится на 2–3 створки для удобного проветривания. Используем усиленный профиль, чтобы створки не провисали на большом пролёте.',
    topCard1Title: 'Лоджия 6 м под ключ',
    topCard1Subtitle: '2–3 створки + монтаж',
    basePrice: 3400,
    packagePrice: 'от 68 000 руб',
    aboutTitle: 'Лоджия 6 метров — простор для жизни и хранения',
  },
  {
    slug: 'krysha-na-balkon',
    name: 'Крыша на балкон',
    seoDescription: 'Установка крыши на балкон в Омске на последнем этаже: металлоконструкция, поликарбонат, гидроизоляция. Защита от снега и дождя. Гарантия 5 лет!',
    heroBadge: '🏗️ Последний этаж — обязательная крыша от снега и дождя',
    heroTitle: 'Крыша на балкон',
    heroTitleHighlight: 'установка в Омске под ключ',
    heroDesc: 'Монтируем металлический козырёк или полноценную крышу на балконах последнего этажа. Гидроизоляция стыка со стеной, защита от протечек.',
    topCard1Title: 'Крыша на балкон',
    topCard1Subtitle: 'Металлокаркас + поликарбонат',
    basePrice: 8500,
    packagePrice: 'от 25 500 руб',
    aboutTitle: 'Крыша на балкон — защита плиты и комфорта',
  },
  {
    slug: 'vynosnoj-balkon',
    name: 'Выносной балкон',
    seoDescription: 'Выносной балкон в Омске: расширение плиты, усиление парапета, остекление. Увеличение площади балкона. Проект, согласование, монтаж от завода!',
    heroBadge: '📦 Расширение площади — вынос по полу или подоконнику',
    heroTitle: 'Выносной балкон',
    heroTitleHighlight: 'строительство в Омске',
    heroDesc: 'Увеличиваем площадь балкона выносом конструкции за фасад. Усиливаем парапет и плиту, согласовываем проект с управляющей компанией.',
    topCard1Title: 'Выносной балкон под ключ',
    topCard1Subtitle: 'Проект + усиление + остекление',
    basePrice: 4100,
    packagePrice: 'от 85 000 руб',
    aboutTitle: 'Выносной балкон — реальное увеличение пространства',
  },
  {
    slug: 'francuzskie-okna',
    name: 'Французские окна',
    seoDescription: 'Французские окна на балконе в Омске — остекление от пола до потолка с закалённым стеклом. Максимум света, стильный вид. Цены от завода!',
    heroBadge: '🪟 Французские окна — элегантность и максимум света',
    heroTitle: 'Французские окна',
    heroTitleHighlight: 'на балконе в Омске',
    heroDesc: 'Полноразмерные окна без подоконника с закалённым стеклом в нижней части. Усиливаем парапет перед монтажом для безопасности.',
    topCard1Title: 'Французские окна 3 м',
    topCard1Subtitle: 'От пола до потолка + усиление',
    basePrice: 3600,
    packagePrice: 'от 54 000 руб',
    aboutTitle: 'Французские окна — архитектурный акцент квартиры',
  },
  {
    slug: 'razdvizhnye-sistemy',
    name: 'Раздвижные системы',
    seoDescription: 'Раздвижное остекление балконов алюминиевым профилем Slidors в Омске от 2 700 ₽/м². Створки не занимают место на балконе. Завод, гарантия 5 лет!',
    heroBadge: '↔️ Раздвижные створки — экономия места на балконе',
    heroTitle: 'Раздвижные системы',
    heroTitleHighlight: 'остекления балконов в Омске',
    heroDesc: 'Алюминиевые раздвижные системы Slidors: створки ездят по рельсам, не мешая размещению мебели и сушилки на балконе.',
    topCard1Title: 'Раздвижное остекление 3 м',
    topCard1Subtitle: 'Slidors + монтаж',
    basePrice: 2700,
    packagePrice: 'от 32 400 руб',
    aboutTitle: 'Раздвижные системы — удобство и практичность',
  },
  {
    slug: 'bezramnoe-osteklenie',
    name: 'Безрамное остекление',
    seoDescription: 'Безрамное остекление балконов в Омске — стеклянные панели без видимых рам, панорамный вид. Для новостроек и коттеджей. Цены от завода!',
    heroBadge: '🔲 Минимум рам — максимум обзора',
    heroTitle: 'Безрамное остекление',
    heroTitleHighlight: 'балконов в Омске',
    heroDesc: 'Стеклянные панели Triplex без массивных рам — эффект «стеклянной стены». Подходит для новостроек с надёжным парапетом.',
    topCard1Title: 'Безрамное остекление 3 м',
    topCard1Subtitle: 'Triplex-стекло + крепления',
    basePrice: 4200,
    packagePrice: 'от 63 000 руб',
    aboutTitle: 'Безрамное остекление — современный премиум-стиль',
  },
  {
    slug: 'kompleksnoe-uteplenie',
    name: 'Комплексное утепление',
    seoDescription: 'Комплексное утепление балконов и лоджий в Омске: Пеноплэкс, Пенофол, пароизоляция. Тёплая лоджия зимой при −40°C. От 1 200 ₽/м². Бесплатный замер!',
    heroBadge: '🌡️ Утепление «термос» — сухо и тепло даже в −40°C',
    heroTitle: 'Комплексное утепление',
    heroTitleHighlight: 'балконов и лоджий в Омске',
    heroDesc: 'Многослойная изоляция: Пеноплэкс на пол и стены, пароизоляция Пенофол, герметизация стыков пеной и составом Стиз.',
    topCard1Title: 'Утепление лоджии 3 м',
    topCard1Subtitle: 'Пеноплэкс + Пенофол + монтаж',
    basePrice: 1200,
    packagePrice: 'от 14 400 руб',
    aboutTitle: 'Комплексное утепление — основа тёплой лоджии',
  },
  {
    slug: 'uteplenie-penopleksom',
    name: 'Утепление Пеноплэксом',
    seoDescription: 'Утепление балкона Пеноплэксом в Омске — влагостойкий утеплитель, не впитывает воду. Идеально для лоджий. Цены от завода, гарантия 5 лет!',
    heroBadge: '💧 Пеноплэкс — не боится влаги и конденсата',
    heroTitle: 'Утепление Пеноплэксом',
    heroTitleHighlight: 'балконов в Омске',
    heroDesc: 'Укладываем экструдированный пенополистирол Пеноплэкс на пол, стены и потолок лоджии. Материал не впитывает влагу и не гниёт.',
    topCard1Title: 'Утепление Пеноплэксом 3 м',
    topCard1Subtitle: 'Стены + пол + потолок',
    basePrice: 1100,
    packagePrice: 'от 13 200 руб',
    aboutTitle: 'Пеноплэкс — надёжная теплоизоляция для Сибири',
  },
  {
    slug: 'uteplenie-penofolom',
    name: 'Утепление Пенофолом',
    seoDescription: 'Утепление балкона Пенофолом в Омске — пароизоляция с отражающим слоем. Дополнительная защита от промерзания. Монтаж от завода-производителя!',
    heroBadge: '✨ Пенофол — отражает тепло обратно в комнату',
    heroTitle: 'Утепление Пенофолом',
    heroTitleHighlight: 'лоджий в Омске',
    heroDesc: 'Монтируем фольгированную пароизоляцию Пенофол поверх утеплителя. Отражающий слой удерживает тепло внутри лоджии.',
    topCard1Title: 'Пароизоляция Пенофол',
    topCard1Subtitle: 'Стены + стыки + герметизация',
    basePrice: 900,
    packagePrice: 'от 10 800 руб',
    aboutTitle: 'Пенофол — финишный слой теплоизоляции',
  },
  {
    slug: 'zimnee-sovmeshchenie-s-komnatoy',
    name: 'Зимнее совмещение с комнатой',
    seoDescription: 'Объединение балкона с комнатой в Омске: демонтаж подоконного блока, утепление, отделка. Жилая площадь по закону. Проект и монтаж под ключ!',
    heroBadge: '🏡 Расширение жилой площади — легально и тепло',
    heroTitle: 'Зимнее совмещение балкона',
    heroTitleHighlight: 'с комнатой в Омске',
    heroDesc: 'Полный цикл объединения: тёплое остекление, утепление, демонтаж подоконного блока, отделка и выравнивание пола на одном уровне с комнатой.',
    topCard1Title: 'Совмещение лоджии с комнатой',
    topCard1Subtitle: 'Утепление + демонтаж блока + отделка',
    basePrice: 4700,
    packagePrice: 'от 78 000 руб',
    aboutTitle: 'Совмещение с комнатой — больше пространства для жизни',
  },
  {
    slug: 'vnutrennyaya-otdelka',
    name: 'Внутренняя отделка',
    seoDescription: 'Внутренняя отделка балконов и лоджий в Омске: ПВХ-панели, евровагонка, ламинат. От 1 500 ₽/м². Завод «Балконные Решения», гарантия 5 лет!',
    heroBadge: '🎨 Превращаем бетонную лоджию в уютное пространство',
    heroTitle: 'Внутренняя отделка',
    heroTitleHighlight: 'балконов и лоджий в Омске',
    heroDesc: 'Отделка стен, потолка и пола: ПВХ-панели, деревянная евровагонка, ламинат, МДФ. Скрываем трубы, проводку и неровности стен.',
    topCard1Title: 'Отделка лоджии 3 м',
    topCard1Subtitle: 'Стены + потолок + пол',
    basePrice: 1500,
    packagePrice: 'от 18 000 руб',
    aboutTitle: 'Внутренняя отделка — финальный штрих вашего балкона',
  },
  {
    slug: 'otdelka-pvh-panelyami',
    name: 'Отделка ПВХ панелями',
    seoDescription: 'Отделка балкона ПВХ-панелями в Омске — влагостойкий материал, быстрый монтаж, большой выбор цветов. От 1 400 ₽/м². Бесплатный замер!',
    heroBadge: '💎 ПВХ-панели — практично, быстро, влагостойко',
    heroTitle: 'Отделка ПВХ панелями',
    heroTitleHighlight: 'балконов в Омске',
    heroDesc: 'Монтаж ПВХ-панелей на обрешётку: влагостойкий материал, не боится перепадов температур, легко моется. Большой выбор фактур и цветов.',
    topCard1Title: 'Обшивка ПВХ 3 м',
    topCard1Subtitle: 'Стены + потолок',
    basePrice: 1400,
    packagePrice: 'от 16 800 руб',
    aboutTitle: 'ПВХ-панели — практичная отделка для омского климата',
  },
  {
    slug: 'vneshnij-sajding-parapeta',
    name: 'Внешний сайдинг парапета',
    seoDescription: 'Облицовка парапета балкона сайдингом в Омске — защита от влаги и мороза, аккуратный внешний вид. Монтаж от завода, гарантия 5 лет!',
    heroBadge: '🛡️ Защита парапета от осадков и промерзания',
    heroTitle: 'Внешний сайдинг парапета',
    heroTitleHighlight: 'балкона в Омске',
    heroDesc: 'Облицовываем наружную часть парапета виниловым или металлическим сайдингом. Защита от влаги, мороза и трещин в бетоне.',
    topCard1Title: 'Сайдинг парапета 3 м',
    topCard1Subtitle: 'Облицовка + гидроизоляция',
    basePrice: 1800,
    packagePrice: 'от 10 800 руб',
    aboutTitle: 'Сайдинг парапета — защита и эстетика фасада',
  },
  {
    slug: 'ukladka-pola-i-laminata',
    name: 'Укладка пола и ламината',
    seoDescription: 'Укладка ламината и напольных покрытий на балконе в Омске: выравнивание стяжки, тёплый пол, плинтуса. От 900 ₽/м². Завод «Балконные Решения»!',
    heroBadge: '🪵 Ровный пол — основа комфорта на лоджии',
    heroTitle: 'Укладка пола и ламината',
    heroTitleHighlight: 'на балконе в Омске',
    heroDesc: 'Выравниваем стяжку, укладываем ламинат 33 класса, влагостойкий линолеум или доску. По желанию — тёплый пол с датчиком.',
    topCard1Title: 'Пол на лоджии 3 м',
    topCard1Subtitle: 'Стяжка + ламинат + плинтуса',
    basePrice: 900,
    packagePrice: 'от 10 800 руб',
    aboutTitle: 'Качественный пол — долговечность и комфорт',
  },
  {
    slug: 'vstroennaya-mebel-i-shkafy',
    name: 'Встроенная мебель и шкафы',
    seoDescription: 'Встроенная мебель и шкафы на балконе в Омске: тумбы, полки, сушилки, рабочие столы по размерам. Изготовление и монтаж от завода!',
    heroBadge: '🗄️ Мебель по размерам — каждый сантиметр работает',
    heroTitle: 'Встроенная мебель и шкафы',
    heroTitleHighlight: 'на балконе в Омске',
    heroDesc: 'Изготавливаем и монтируем встроенные шкафы, тумбы, полки, рабочие столы и потолочные сушилки точно по размерам вашей лоджии.',
    topCard1Title: 'Шкаф на лоджию 3 м',
    topCard1Subtitle: 'Проект + изготовление + монтаж',
    basePrice: 900,
    packagePrice: 'от 12 000 руб',
    aboutTitle: 'Встроенная мебель — эргономика балконного пространства',
  },
  {
    slug: 'zamena-ostekleniya-v-novostrojke',
    name: 'Замена остекления в новостройке',
    seoDescription: 'Замена застройщического остекления балкона в новостройке Омска на качественный профиль REHAU/VEKA. Демонтаж, монтаж за 1 день. Цены от завода!',
    heroBadge: '🏗️ Новостройка — замена холодного остекления на тёплое',
    heroTitle: 'Замена остекления в новостройке',
    heroTitleHighlight: 'в Омске под ключ',
    heroDesc: 'Демонтируем некачественное остекление застройщика и устанавливаем тёплый ПВХ-профиль с двухкамерным стеклопакетом. Работаем во всех новостройках Омска.',
    topCard1Title: 'Замена остекления 3 м',
    topCard1Subtitle: 'Демонтаж + ПВХ REHAU + монтаж',
    basePrice: 3300,
    packagePrice: 'от 39 600 руб',
    aboutTitle: 'Новостройка — право на качественное остекление',
  },
  {
    slug: 'osteklenie-v-stalinke',
    name: 'Остекление в Сталинке',
    seoDescription: 'Остекление балконов в сталинках Омска с учётом толстых стен и высоких потолков. Индивидуальный проект, усиление парапета. Завод, гарантия 5 лет!',
    heroBadge: '🏛️ Сталинки — высокие потолки и массивные стены',
    heroTitle: 'Остекление в Сталинке',
    heroTitleHighlight: 'балконов в Омске',
    heroDesc: 'Работаем с особенностями сталинских домов: высокие потолки, толстые стены, массивные парапеты. Индивидуальный проект для каждой квартиры.',
    topCard1Title: 'Остекление в сталинке',
    topCard1Subtitle: 'Проект + усиление + монтаж',
    basePrice: 3500,
    packagePrice: 'от 52 500 руб',
    aboutTitle: 'Сталинка — индивидуальный подход к каждому балкону',
  },
  {
    slug: 'osteklenie-v-kottedzhe',
    name: 'Остекление в Коттедже',
    seoDescription: 'Остекление балконов и террас в коттеджах Омска и области: панорамное, тёплое, безрамное. Проектирование, монтаж. Цены от завода-производителя!',
    heroBadge: '🏡 Коттедж — панорамное остекление террас и балконов',
    heroTitle: 'Остекление в Коттедже',
    heroTitleHighlight: 'и на террасе в Омске',
    heroDesc: 'Остекляем балконы и террасы в коттеджах: панорамные системы, раздвижные конструкции, тёплое остекление для круглогодичного использования.',
    topCard1Title: 'Остекление террасы',
    topCard1Subtitle: 'Проект + монтаж + гарантия',
    basePrice: 4500,
    packagePrice: 'от 90 000 руб',
    aboutTitle: 'Коттедж — остекление без компромиссов',
  },
  {
    slug: 'francuzskoe-osteklenie',
    name: 'Французское остекление',
    seoDescription: 'Французское остекление балконов в Омске — окна от пола до потолка, закалённое стекло, усиление парапета. Премиум-вид, цены от завода!',
    heroBadge: '🪟 Французское остекление — стиль и максимум света',
    heroTitle: 'Французское остекление',
    heroTitleHighlight: 'балконов в Омске',
    heroDesc: 'Стеклянная стена от пола до потолка с закалённым стеклом в нижней части. Усиливаем парапет, проводим техническое обследование плиты.',
    topCard1Title: 'Французское остекление 3 м',
    topCard1Subtitle: 'От пола до потолка + усиление',
    basePrice: 3600,
    packagePrice: 'от 54 000 руб',
    aboutTitle: 'Французское остекление — архитектура света',
  },
  {
    slug: 's-vynosom-po-polu',
    name: 'Остекление с выносом по полу',
    seoDescription: 'Остекление балкона с выносом по полу в Омске — расширение площади на 30–40 см. Усиление основания, монтаж от завода. Бесплатный замер!',
    heroBadge: '📐 Вынос по полу — реальное увеличение площади',
    heroTitle: 'Остекление с выносом по полу',
    heroTitleHighlight: 'балкона в Омске',
    heroDesc: 'Расширяем плиту балкона наружу на 30–40 см по линии пола. Усиливаем основание металлокаркасом перед монтажом остекления.',
    topCard1Title: 'Вынос по полу 3 м',
    topCard1Subtitle: 'Усиление + остекление',
    basePrice: 4100,
    packagePrice: 'от 58 000 руб',
    aboutTitle: 'Вынос по полу — больше места для жизни',
  },
  {
    slug: 'vynos-po-podokonniku',
    name: 'Вынос по подоконнику',
    seoDescription: 'Вынос остекления по подоконнику в Омске — расширение подоконной доски на 15–20 см без нагрузки на плиту. Завод «Балконные Решения»!',
    heroBadge: '🪟 Вынос по подоконнику — больше места для цветов',
    heroTitle: 'Вынос по подоконнику',
    heroTitleHighlight: 'остекления в Омске',
    heroDesc: 'Расширяем подоконную доску на 15–20 см без увеличения нагрузки на плиту. Идеально для размещения цветов и декора.',
    topCard1Title: 'Вынос по подоконнику 3 м',
    topCard1Subtitle: 'Расширение + остекление',
    basePrice: 3800,
    packagePrice: 'от 45 600 руб',
    aboutTitle: 'Вынос по подоконнику — лёгкое расширение пространства',
  },
  {
    slug: 'osteklenie-s-vinosom',
    name: 'Остекление с выносом',
    seoDescription: 'Остекление балкона с выносом в Омске — расширение по подоконнику или полу. Увеличение площади, усиление парапета. Цены от завода от 4 100 ₽/м²!',
    heroBadge: '📦 Остекление с выносом — больше места на балконе',
    heroTitle: 'Остекление с выносом',
    heroTitleHighlight: 'балкона в Омске',
    heroDesc: 'Комбинируем остекление с расширением балкона по линии подоконника или пола. Увеличиваем полезную площадь без сложного согласования.',
    topCard1Title: 'Остекление с выносом 3 м',
    topCard1Subtitle: 'Расширение + ПВХ-остекление',
    basePrice: 4100,
    packagePrice: 'от 49 200 руб',
    aboutTitle: 'Остекление с выносом — практичное расширение балкона',
  },
  {
    slug: 'balkony-pod-klyuch',
    name: 'Балконы под ключ',
    seoDescription: 'Ремонт балкона под ключ в Омске: остекление, утепление, отделка, электрика, мебель. Единый подрядчик, фиксированная смета. Гарантия 5 лет!',
    heroBadge: '🔑 Всё в одном договоре — от плиты до финиша',
    heroTitle: 'Балконы под ключ',
    heroTitleHighlight: 'в Омске от завода',
    heroDesc: 'Комплексный ремонт: усиление плиты, остекление, утепление, внутренняя и внешняя отделка, электрика и встроенная мебель. Один подрядчик — одна гарантия.',
    topCard1Title: 'Балкон под ключ 3 м',
    topCard1Subtitle: 'Остекление + утепление + отделка',
    basePrice: 5600,
    packagePrice: 'от 68 000 руб',
    aboutTitle: 'Под ключ — сдаём готовую лоджию за 2–3 дня',
  },
  {
    slug: 'balkonnye-bloki',
    name: 'Балконные блоки',
    seoDescription: 'Балконный блок ПВХ в Омске: дверь + боковое окно в комнату. REHAU, VEKA, монтаж за 1 день. Цены от завода от 24 500 ₽. Бесплатный замер!',
    heroBadge: '🚪 Балконный блок — дверь и окно в едином стиле',
    heroTitle: 'Балконные блоки',
    heroTitleHighlight: 'ПВХ в Омске',
    heroDesc: 'Изготавливаем и монтируем балконные блоки: дверь на лоджию + боковое окно в комнату. Единый дизайн, надёжная фурнитура, установка за один день.',
    topCard1Title: 'Балконный блок ПВХ',
    topCard1Subtitle: 'Дверь + окно + монтаж',
    basePrice: 24500,
    packagePrice: 'от 24 500 руб',
    aboutTitle: 'Балконный блок — единый стиль квартиры',
  },
  {
    slug: 'okna-plastikovye',
    name: 'Пластиковые окна',
    seoDescription: 'Пластиковые окна REHAU и VEKA в Омске от завода-производителя. Энергосберегающие стеклопакеты, монтаж по ГОСТ, гарантия 5 лет. Бесплатный замер!',
    heroBadge: '🪟 REHAU и VEKA — напрямую с завода в Омске',
    heroTitle: 'Пластиковые окна',
    heroTitleHighlight: 'в Омске от производителя',
    heroDesc: 'Изготавливаем пластиковые окна для комнат, кухонь и лоджий на собственном производстве. Энергосберегающие стеклопакеты, немецкая фурнитура.',
    topCard1Title: 'Окно ПВХ 1400×1400',
    topCard1Subtitle: 'REHAU Blitz + монтаж',
    basePrice: 8500,
    packagePrice: 'от 8 500 руб',
    aboutTitle: 'Пластиковые окна — тепло и тишина в каждой комнате',
  },
];

const HAND_CRAFTED_SERVICE_FALLBACKS: Record<string, ServiceFallback> = {
  'teploe-osteklenie-pvh': {
    slug: 'teploe-osteklenie-pvh',
    name: 'Тёплое остекление балконов ПВХ в Омске',
    seoDescription:
      'Тёплое остекление балконов ПВХ-профилем REHAU и VEKA в Омске от завода-производителя. Пятикамерный профиль, двухкамерный стеклопакет, монтаж за 1 день, заводская гарантия 5 лет. Бесплатный замер — +7 (908) 106-83-52!',
    heroBadge: '🏭 Собственное производство ПВХ-окон — напрямую с завода в Омске',
    heroTitle: 'Тёплое остекление балконов в Омске',
    heroTitleHighlight: 'тёплая лоджия круглый год',
    heroDesc:
      'Превращаем промёрзшую лоджию в комфортное помещение: герметичные рамы, тёплые откосы и защита от сквозняков. Монтаж за один день без лишней суеты. Бесплатный замер, производство на заводе по ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('teploe-osteklenie-pvh', 'production'),
    topCard1Title: 'Тёплое остекление лоджии 3 м',
    topCard1Subtitle: 'ПВХ профиль REHAU / VEKA + монтаж под ключ',
    topCard1Price: 'от 38 400 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На профиль, стеклопакеты и качество монтажа по ГОСТ 30971-2012',
    aboutBadge: 'Почему выбирают ПВХ в Омске',
    aboutTitle: 'Тёплое остекление — единственный правильный стандарт для сибирской зимы',
    aboutImage: 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/okna-v-pol-veka-na-teplom-balkone-750x750.jpg',
    seoText: `Омск входит в пятёрку городов России с самыми продолжительными морозами: средняя температура января −18°C, абсолютный минимум — −40°C. В таких условиях трёхкамерный профиль, который активно предлагают бюджетные фирмы, промерзает насквозь при −25°C. Именно поэтому мы используем только пятикамерные системы REHAU Grazio 82 и VEKA Softline 82 с шириной профильного пакета 82 мм: коэффициент сопротивления теплопередаче Rf профиля достигает 1,06 м²·К/Вт, что вдвое превышает требования СП 50.13330 для климатической зоны Омска.

Стеклопакет — не менее важная часть системы. Мы устанавливаем двухкамерный стеклопакет формулой 4-14Ar-4-14Ar-4 (общая толщина 44 мм) с низкоэмиссионным i-стеклом на внутреннем листе. Заполнение камер аргоном снижает теплопроводность газового промежутка с 0,026 до 0,017 Вт/м·К. Итоговый Rw стеклопакета — 1,18 м²·К/Вт. При ─40°C на улице температура внутренней поверхности стекла не опускается ниже +8°C — конденсат и наледь исключены физически.

Монтаж выполняется строго по ГОСТ 30971-2012: наружный шов закрывается паропроницаемой саморасширяющейся лентой ПСУЛ (предотвращает продувание), средний слой — профессиональная монтажная пена Soudal с коэффициентом теплопроводности 0,042 Вт/м·К, внутренний шов — пароизоляционная лента. Такая трёхслойная технология шва гарантирует отсутствие сквозняков и промерзания откосов даже спустя 10 лет.

Фурнитура MACO (Австрия) или Siegenia (Германия) сохраняет класс герметизации A3 при температурах от −40°C до +80°C. Ручки — антивандальные с защитой от детей. Все наши изделия изготавливаются на собственном производстве по ул. Гусарова, д. 26 — без посредников, что обеспечивает экономию 25–30% по сравнению с фирмами-перекупщиками.`,
    glazingCard: [
      {
        title: 'ПВХ REHAU Blitz — 3-камерный',
        price: '3 200',
        desc: 'Базовый тёплый профиль для большинства омских лоджий. Ширина 60 мм, двухкамерный стеклопакет 32 мм. Выдерживает −40°C без промерзания откосов.',
        img: CARD_IMG_A,
        badge: 'Хит продаж',
      },
      {
        title: 'ПВХ REHAU Grazio — 5-камерный',
        price: '3 800',
        desc: 'Топовая система 82 мм для присоединения лоджии к комнате. Двухкамерный стеклопакет с i-стеклом и аргоном. Rf профиля 1,06 м²·К/Вт.',
        img: CARD_IMG_B,
        badge: 'Максимум тепла',
      },
      {
        title: 'Балконный блок ПВХ VEKA',
        price: '24 500',
        desc: 'Комплект «дверь + боковое окно» в едином профиле VEKA Softline. Монтаж за один день, включая откосы и подоконник.',
        img: CARD_IMG_C,
        badge: 'Комплект',
      },
      {
        title: 'ПВХ + утепление «термос»',
        price: '4 700',
        desc: 'Тёплое остекление + Пеноплэкс 50 мм на стены/пол + Пенофол + герметизация Стиз-А/Б. Лоджия прогревается до +18°C при −40°C снаружи.',
        img: IMG_WARM_LIVING,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Прямой балкон',
        title: 'Тёплое ПВХ остекление прямого балкона',
        desc: 'Классическая схема для панельных домов Омска: одна фронтальная рама из 5-камерного ПВХ-профиля, боковые стены — сэндвич-панели или глухие створки. Монтаж за 4–6 часов.',
        features: [
          'Профиль выдерживает морозы до −45°C без деформации',
          'Тёплый монтажный шов с ПСУЛ и пароизоляционной лентой',
          'После утепления — готово к присоединению к комнате',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Угловой балкон',
        title: 'Г-образное тёплое остекление ПВХ',
        desc: 'Две стеклянные секции: широкая фронтальная и боковая. Угловой соединительный профиль исключает мостик холода. Популярно в хрущёвках и кирпичных домах Омска.',
        features: [
          'Угловой профиль без мостиков холода',
          'Боковая секция — глухая или распашная по желанию',
          'Усиленное крепление анкерами к парапету и стене',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Лоджия 6 метров',
        title: 'Тёплое ПВХ остекление длинной лоджии 6 м',
        desc: 'Длинный пролёт делим на 2–3 поворотно-откидные или распашные секции. Усиленный армирующий профиль 2,5 мм исключает провисание створок на 6-метровом пролёте.',
        features: [
          'Армирование стали толщиной 2,5 мм в каждом профиле',
          'Микропроветривание на каждой из 3 секций',
          'Монтаж за 1 рабочий день без выселения жильцов',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'holodnoe-osteklenie-al': {
    slug: 'holodnoe-osteklenie-al',
    name: 'Холодное алюминиевое остекление лоджий в Омске',
    seoDescription:
      'Холодное остекление балконов алюминиевым профилем Slidors и Provedal в Омске от 2 700 ₽/м². Раздвижные створки весом 6–8 кг/м², защита от ветра, пыли и дождя. Монтаж за 1 день, гарантия 5 лет!',
    heroBadge: '⚡ Алюминий Slidors — лёгкие раздвижные системы без нагрузки на плиту',
    heroTitle: 'Холодное остекление балконов в Омске',
    heroTitleHighlight: 'защита от ветра и дождя без лишней нагрузки',
    heroDesc:
      'Лёгкие алюминиевые конструкции закрывают балкон от ветра, пыли и осадков — идеально для старого фонда и последних этажей. Створки не занимают место на балконе, монтаж за один день. Бесплатный выезд замерщика, завод на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('holodnoe-osteklenie-al', 'production'),
    topCard1Title: 'Холодное остекление лоджии 3 м',
    topCard1Subtitle: 'Алюминий Slidors — раздвижные створки',
    topCard1Price: 'от 32 400 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На алюминиевый профиль, ролики и качество монтажа',
    aboutBadge: 'Когда алюминий — правильный выбор',
    aboutTitle: 'Холодное остекление — защита без лишнего веса',
    aboutImage: 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/alyuminievye-balkonnye-ramy-s-naruzhnoj-otdelkoj-750x750.jpg',
    seoText: `Холодное алюминиевое остекление выбирают не потому что оно «дешевле», а потому что оно технически правильнее в ряде ситуаций. Главный аргумент — масса конструкции. Рама из анодированного алюминия весит 6–8 кг на погонный метр, тогда как ПВХ-профиль с двухкамерным стеклопакетом — 18–22 кг/пм. Для хрущёвок серий 1-447 и 1-464, где расчётная нагрузка на балконную плиту не превышает 200 кг, разница принципиальна: алюминиевая система не создаёт предельных нагрузок даже без предварительного обследования.

Мы работаем с системами Slidors (раздвижная) и Provedal (распашная). Slidors — наиболее популярный вариант: створки перемещаются по нижнему несущему и верхнему направляющему рельсам из профиля 8×20 мм. Ролики из нейлона с подшипником выдерживают 50 000 циклов открывания. Уплотнитель EPDM по всему периметру створки обеспечивает ветрозащиту при порывах до 28 м/с — этого достаточно для омских «сибирских» ветров зимой. Важно понимать: холодное остекление не является теплоизоляцией. Оно снижает продувание, задерживает пыль и дождь, но не создаёт термобарьера. Если цель — тёплая лоджия, нужен ПВХ-профиль.

Профиль Slidors производится методом экструзии из сплава АД31Т с анодированием 15 мкм (класс С по ГОСТ 9.303). Такое покрытие не ржавеет, не требует окраски и выдерживает перепады от −50°C до +80°C — критично для омского климата, где летом термометр показывает +35°C, а зимой −40°C. Алюминий не деформируется от температурных расширений: коэффициент линейного расширения 0,0000235 м/м·°C обеспечивает стабильность геометрии рамы при суточных перепадах 30–40°C.

Монтаж занимает 3–5 часов для лоджии 3 метра. Рама крепится к парапету анкерами 8×80 мм с шагом не более 600 мм. Верхняя часть фиксируется к потолочной плите или к специальному опорному профилю. После установки регулируем ролики и проверяем легкость хода — створки должны перемещаться усилием не более 3 Н. Перед сдачей объекта проводим влажную уборку и вывоз строительного мусора.`,
    glazingCard: [
      {
        title: 'Slidors — раздвижная система',
        price: '2 700',
        desc: 'Анодированный алюминий с нижним рельсом, нейлоновые ролики на подшипниках. Вес рамы 6 кг/пм. Ветрозащита до 28 м/с, ход без усилий.',
        img: CARD_IMG_B,
        badge: 'Хит продаж',
      },
      {
        title: 'Provedal — распашная система',
        price: '2 900',
        desc: 'Классические распашные петлевые створки. Уплотнитель EPDM по периметру, надёжная герметизация даже при косом дожде. Для узких балконов.',
        img: CARD_IMG_A,
        badge: 'Лучшая герметизация',
      },
      {
        title: 'Алюминий + козырёк из поликарбоната',
        price: '3 400',
        desc: 'Раздвижное остекление + козырёк 8 мм поликарбонат на металлокаркасе. Полная защита от снега, дождя и льда сверху. Для последних этажей.',
        img: CARD_IMG_C,
        badge: 'Для последнего этажа',
      },
      {
        title: 'Безрамное алюминиевое остекление',
        price: '4 200',
        desc: 'Стеклянные панели Triplex 6 мм в алюминиевых зажимах без видимых рам. Максимальный световой поток, современный вид. Для новостроек.',
        img: CARD_IMG_D,
        badge: 'Премиум вид',
      },
    ],
    StructureTab: [
      {
        tabName: 'Прямой балкон',
        title: 'Холодное алюминиевое остекление прямого балкона',
        desc: 'Одна раздвижная секция Slidors. Вес конструкции 18–25 кг на лоджию 3 м — не создаёт нагрузки на ослабленную плиту. Монтаж за 3 часа.',
        features: [
          'Вес в 3 раза меньше ПВХ-остекления',
          'Раздвижные створки не занимают место на балконе',
          'Защита от ветра, пыли и атмосферных осадков',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Угловой балкон',
        title: 'Г-образное холодное остекление алюминием',
        desc: 'Две Slidors-секции с угловым соединительным элементом 90°. Не требует усиления парапета — идеально для хрущёвок Омска с ограниченной несущей способностью.',
        features: [
          'Угловой профиль с герметичным EPDM-соединением',
          'Не требует усиления парапета',
          'Монтаж 4–5 часов, без демонтажа парапета',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Последний этаж',
        title: 'Алюминиевое остекление + крыша на последнем этаже',
        desc: 'Для балконов без крыши: лёгкий алюминий Slidors + металлокаркасный козырёк с поликарбонатом 8 мм. Защита от снеговой нагрузки до 180 кг/м².',
        features: [
          'Минимальная нагрузка на плиту перекрытия',
          'Козырёк с уклоном 10–15° для схода снега',
          'Гидроизоляция примыкания козырька к стене',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'panoramnoe-osteklenie': {
    slug: 'panoramnoe-osteklenie',
    name: 'Панорамное остекление балконов от пола до потолка в Омске',
    seoDescription:
      'Панорамное остекление балконов от пола до потолка в Омске — французские витражные окна, закалённое стекло 8 мм, усиление парапета металлокаркасом. Цены от 3 500 ₽/м². Монтаж 1–2 дня, гарантия 5 лет!',
    heroBadge: '🌅 Французские витражи — стеклянная стена от пола до потолка в Омске',
    heroTitle: 'Панорамное остекление балконов в Омске',
    heroTitleHighlight: 'максимум света и обзора',
    heroDesc:
      'Стеклянные конструкции от пола до потолка наполняют комнату светом и создают эффект просторной зоны отдыха. Перед монтажом усиливаем парапет для безопасности. Бесплатный замер, изготовление на заводе по ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('panoramnoe-osteklenie', 'interiors'),
    topCard1Title: 'Панорамное остекление лоджии 3 м',
    topCard1Subtitle: 'Витраж от пола до потолка + усиление парапета',
    topCard1Price: 'от 52 500 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На стеклопакеты, закалённое стекло, металлокаркас и монтаж',
    aboutBadge: 'Премиум остекление',
    aboutTitle: 'Панорамное остекление — архитектурный акцент и максимум света',
    aboutImage: 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/francuzskoe-osteklenie-balkonov-slajdors-750x750.jpg',
    seoText: `Панорамное (французское) остекление — это не просто большие окна: это принципиально другая концепция светового пространства. Стандартное остекление балкона дает площадь остекления 45–55% от фасада. Французский витраж — 85–95%. Разница ощущается физически: комната при открытой лоджии кажется больше, освещённость возрастает вдвое. В условиях омских коротких световых дней (декабрь — всего 7–8 часов) это особенно ценно.

Нижняя часть витража — ключевое инженерное решение. Мы используем закалённое стекло толщиной 8 мм или Triplex (стекло-плёнка-стекло 6.4.6 мм) для зон ниже 90 см. Закалённое стекло при разрушении рассыпается на мелкие безопасные осколки без острых кромок — соответствует ГОСТ 30826 и требованиям безопасности для жилых помещений. Морозостойкость закалённого стекла — от −50°C, что перекрывает омский минимум с запасом.

Парапет под французский витраж всегда требует усиления. Стандартный бетонный или кирпичный парапет толщиной 100–150 мм не рассчитан на боковые нагрузки от остекления выше 1,2 м. Мы устанавливаем металлокаркас из профильной трубы 60×60×3 мм, анкерованной в плиту на глубину 150 мм с шагом 400 мм. Расчётная горизонтальная нагрузка — 300 Н/м, что соответствует СП 20.13330 для ограждений балконов.

Температурные деформации — ещё один нюанс, о котором умалчивают бюджетные подрядчики. При суточных перепадах 40°C (характерных для омской весны и осени) алюминиевая рама изменяет размеры на 1–1,5 мм/м. В конструкции предусмотрены компенсационные зазоры 5–8 мм на каждый стык, заполненные эластичным герметиком. Без них через год появятся трещины в примыканиях и сквозняки. Все наши конструкции проходят расчёт температурных деформаций до передачи в производство.`,
    glazingCard: [
      {
        title: 'Панорама ПВХ — тёплый витраж',
        price: '3 500',
        desc: 'Полноразмерный ПВХ витраж REHAU 5-камерный, высота до 2 800 мм. Нижняя часть — закалённое стекло 8 мм. Тёплый монтаж с ПСУЛ.',
        img: IMG_PANORAMA,
        badge: 'Тёплый витраж',
      },
      {
        title: 'Панорама алюминий — холодный витраж',
        price: '4 200',
        desc: 'Алюминиевая панорамная система с минимальными профилями 40 мм. Створки распашные или раздвижные. Лёгкая конструкция, максимальная площадь стекла.',
        img: CARD_IMG_A,
        badge: 'Минимум рам',
      },
      {
        title: 'Панорама + вынос по полу',
        price: '5 800',
        desc: 'Французский витраж + расширение плиты на 30 см металлокаркасом. Реальное увеличение площади и максимум обзора. Проект и согласование включены.',
        img: CARD_IMG_D,
        badge: 'Больше места',
      },
      {
        title: 'Безрамное панорамное (Triplex)',
        price: '6 500',
        desc: 'Стекло Triplex 6.4.6 мм без видимых рам в алюминиевых зажимах. Эффект «стеклянной стены». Для новостроек и коттеджей с надёжным парапетом.',
        img: IMG_WARM_LIVING,
        badge: 'Эксклюзив',
      },
    ],
    StructureTab: [
      {
        tabName: 'Прямой балкон',
        title: 'Французский витраж на прямом балконе',
        desc: 'Фронтальная стеклянная стена высотой до 2 800 мм. Нижняя часть до 90 см — закалённое стекло 8 мм или глухая панель. Парапет усиливается металлокаркасом.',
        features: [
          'В 2,3 раза больше естественного света',
          'Закалённое стекло — безопасность по ГОСТ 30826',
          'Металлокаркас 60×60×3 мм, анкерование 150 мм в плиту',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Угловой балкон',
        title: 'Панорамное Г-образное остекление',
        desc: 'Две стеклянные стены на 90° — обзор в двух направлениях. Угловое соединение без мостиков холода и «мёртвых» вертикальных зон. Для угловых квартир в новостройках Омска.',
        features: [
          'Обзор на две стороны с одного балкона',
          'Угловое соединение без вертикального профиля',
          'Индивидуальный расчёт нагрузки на плиту',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'П-образный балкон',
        title: 'Панорамное трёхстороннее остекление 180°',
        desc: 'Три стеклянные стены — обзор 180°. Требует технического обследования плиты, обязательного усиления и согласования проекта. Работаем только с подтверждённой несущей способностью.',
        features: [
          'Полный панорамный обзор на три стороны',
          'Техническое обследование плиты перед монтажом',
          'Проект и согласование с управляющей компанией',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'osteklenie-v-hhrushchevke': {
    slug: 'osteklenie-v-hhrushchevke',
    name: 'Остекление балконов в хрущёвках Омска',
    seoDescription:
      'Остекление балконов в хрущёвках Омска: серии 1-447, 1-464, 1-335. Обследование плиты, укрепление парапета металлокаркасом, тёплое и холодное остекление. Монтаж за 1 день, гарантия 5 лет!',
    heroBadge: '🏢 Специализация на хрущёвках Омска — знаем каждую серию',
    heroTitle: 'Остекление балконов в хрущёвках Омска',
    heroTitleHighlight: 'с учётом состояния плиты и парапета',
    heroDesc:
      'Знаем особенности типовых хрущёвок: перед монтажом бесплатно осматриваем плиту и парапет, подбираем лёгкое или тёплое остекление и при необходимости усиливаем основание. Монтаж за один день. Завод по ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('osteklenie-v-hhrushchevke', 'exteriors'),
    topCard1Title: 'Балкон под ключ в хрущёвке',
    topCard1Subtitle: 'Усиление + остекление + утепление + отделка',
    topCard1Price: 'от 68 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На усиление парапета, остекление и отделку',
    aboutBadge: 'Экспертиза по хрущёвкам Омска',
    aboutTitle: 'Хрущёвки: знаем особенности каждой серии',
    aboutImage: 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/ustanovka-balkonnykh-ram-kbe-master-70-mm-750x750.jpg',
    seoText: `Хрущёвки Омска — это отдельная инженерная история. Дома серий 1-447, 1-464 и 1-335, построенные в 1960-х–1970-х, имеют балконные плиты толщиной 100–120 мм с арматурой А-I диаметром 8–10 мм. Расчётная нагрузка на плиту по проекту — 150–200 кг, включая вес людей и лёгкой мебели. ПВХ-остекление с двухкамерным стеклопакетом весит 20–25 кг/пм: для 3-метрового балкона это 60–75 кг только рама плюс стекло. Добавьте снеговую нагрузку 90–120 кг зимой в Омске — и запас прочности старой плиты оказывается на пределе.

Именно поэтому мы начинаем с бесплатного обследования. Мастер приезжает, простукивает плиту и парапет, осматривает состояние арматуры в местах сколов и определяет фактическое состояние бетона. По результатам даём рекомендацию: алюминий (6–8 кг/пм) без усиления или ПВХ с обязательным металлокаркасом парапета. Последний вариант встречается в 70% хрущёвок Омска — и мы его делаем качественно.

Усиление парапета — это не косметика. Мы свариваем металлокаркас из профильной трубы 40×20×2 мм: горизонтальные пояса с шагом 400 мм, вертикальные стойки с шагом 600 мм, анкерование в плиту на 100 мм. Конструкция принимает на себя боковые нагрузки от ПВХ-рамы и передаёт их на плиту равномерно, не создавая точечных концентраций напряжений. После этого устанавливаем ПВХ-профиль с уверенностью в долговечности результата.

Серия К-7 — отдельный случай: угловые балконы в этих домах имеют выступающую боковую консоль без нижней опоры. Здесь мы используем только лёгкий алюминий Slidors и всегда усиливаем вертикальную стойку консоли металлическим уголком 50×50×5 мм с приваркой к плите. За 15 лет работы в Омске ни один наш объект не имел претензий по несущей части.`,
    glazingCard: [
      {
        title: 'Алюминий Slidors (без усиления)',
        price: '2 700',
        desc: 'Лёгкий алюминий — только 6–8 кг/пм. Безопасен для ослабленных плит хрущёвок без предварительного усиления. Ветрозащита, пылезащита, дождезащита.',
        img: CARD_IMG_B,
        badge: 'Без усиления',
      },
      {
        title: 'ПВХ REHAU + усиление парапета',
        price: '3 200',
        desc: 'ПВХ 5-камерный после монтажа металлокаркаса парапета. Тёплое остекление с полным сохранением несущей безопасности плиты.',
        img: CARD_IMG_A,
        badge: 'Тёплое тепло',
      },
      {
        title: 'Усиление парапета (отдельно)',
        price: '8 500',
        desc: 'Металлокаркас 40×20 мм из профтрубы с анкерованием в плиту. Принимает боковые нагрузки и равномерно распределяет вес ПВХ-рамы.',
        img: CARD_IMG_C,
        badge: 'Обязательный этап',
      },
      {
        title: 'Комплекс «хрущёвка под ключ»',
        price: '5 600',
        desc: 'Усиление + ПВХ REHAU + Пеноплэкс 50 мм + евровагонка + электрика. Готовая тёплая комната за 3 рабочих дня.',
        img: CARD_IMG_D,
        badge: 'Всё включено',
      },
    ],
    StructureTab: [
      {
        tabName: 'Угловая хрущёвка (1-447)',
        title: 'Остекление углового балкона серии 1-447',
        desc: 'Типовой угловой выступ: фронтальная секция 3 м + боковая 1,2 м. Боковая стена несущая — остекляем только выступающую часть. Алюминий без нагрузки на перегородку.',
        features: [
          'Фронтальная + боковая секции без касания несущей стены',
          'Алюминий или ПВХ — по результатам обследования плиты',
          'Монтаж за 1 день, уборка строительного мусора',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Прямая лоджия (1-464)',
        title: 'Остекление прямой лоджии серии 1-464',
        desc: 'Стандартная лоджия 3 м с низким парапетом 700–800 мм. Перед монтажом ПВХ поднимаем парапет или усиливаем металлокаркасом. Алюминий — без поднятия.',
        features: [
          'Поднятие парапета до 900 мм для безопасности',
          'Монтаж за 1 день без выселения жильцов',
          'Вывоз и уборка включены в цену',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Последний этаж (хрущёвка)',
        title: 'Балкон на последнем этаже хрущёвки',
        desc: 'Сложнейший случай: нет крыши, снеговая нагрузка прямо на плиту. Алюминий Slidors + металлокаркасный козырёк с поликарбонатом 8 мм + усиление плиты уголком.',
        features: [
          'Козырёк с уклоном 12° для схода снега',
          'Обязательное усиление плиты металлическими уголками',
          'Гидроизоляция стыка козырька со стеной',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'obshivka-evrovagonkoy': {
    slug: 'obshivka-evrovagonkoy',
    name: 'Обшивка балкона евровагонкой в Омске',
    seoDescription:
      'Обшивка балкона евровагонкой в Омске от 1 500 ₽/м²: сосна высшего сорта класса «Экстра», монтаж на обрешётку с Пенофолом, покрытие лаком OSMO. Монтаж 1–2 дня, гарантия 5 лет. Звоните!',
    heroBadge: '🌲 Евровагонка класса «Экстра» — сосна без сучков и смоляных карманов',
    heroTitle: 'Обшивка балкона евровагонкой в Омске',
    heroTitleHighlight: 'уют натурального дерева',
    heroDesc:
      'Отделываем стены и потолок качественной хвойной вагонкой — тёплый интерьер без холодного бетона. Монтируем на обрешётку с пароизоляцией, чтобы дерево служило долго. Бесплатный замер, производство на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('obshivka-evrovagonkoy', 'interiors'),
    topCard1Title: 'Обшивка лоджии 3 м евровагонкой',
    topCard1Subtitle: 'Стены + потолок + обрешётка + пароизоляция',
    topCard1Price: 'от 18 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На материалы, обрешётку и качество монтажа',
    aboutBadge: 'Натуральные материалы',
    aboutTitle: 'Евровагонка класса «Экстра» — тепло и уют натурального дерева',
    aboutImage: 'https://balkonreshenie.ru/uploads/thumbnail_vnutrennyaya_otdelka_balkona_300x300_fb64c0553f.png?updatedAt=2026-06-18T21%3A46%3A30.816Z',
    seoText: `Евровагонка — не то же самое, что советская вагонка из ДСП. Мы используем только натуральную хвойную (сосна, ель) вагонку класса «Экстра» по ГОСТ 8242-88: без сучков, смоляных карманов и синевы. Геометрия профиля EU (европейский стандарт): рабочая ширина доски 88 мм, толщина 14 мм, глубина шипа 8 мм. Такая геометрия обеспечивает плотный замок без видимых щелей при усыхании дерева — а усыхание в Омске неизбежно: зимой влажность воздуха на балконе 30–40%, летом 70–80%.

Перед монтажом каждую доску осматриваем и отбраковываем экземпляры с дефектами. Обрешётку изготавливаем из сухого бруса 40×40 мм (влажность не более 12%) с предварительной пропиткой биозащитным составом Neomid 430. Шаг обрешётки — 500 мм, крепление к стене на дюбель-гвоздях 6×60 мм. Между стеной и обрешёткой укладываем Пенофол тип С (фольга с двух сторон) толщиной 3 мм — он работает как пароизоляция и теплоотражатель одновременно. Вентиляционный зазор 20–25 мм между Пенофолом и досками обеспечивает циркуляцию воздуха: дерево остаётся сухим и не гниёт даже при конденсате в переходный период.

Вагонку монтируем с нижнего ряда с помощью специальных кляймеров — скобок, которые фиксируют доску в пазу и одновременно зажимают следующую. Никаких открытых гвоздей, видимых крепежей и щелей. Верхний ряд закрываем потолочным плинтусом из той же сосны. Торцы доски на оконных откосах закрываем наличниками из МДФ или ПВХ.

Финишная защита — обязательный этап для омского климата. Перепады температур −40°C зимой и +35°C летом — это 75°C суточного диапазона в межсезонье. Без защитного покрытия сосна потемнеет через 2–3 года. Мы наносим два слоя лака OSMO Polyx-Oil (Германия) или пропитки Pinotex Interior — они глубоко проникают в древесину, не образуют плёнку и не трескаются при деформации дерева от температуры.`,
    glazingCard: [
      {
        title: 'Вагонка сосна «Экстра» (стены + потолок)',
        price: '1 500',
        desc: 'Класс «Экстра» без сучков и смол, толщина 14 мм, EU-профиль. Обрешётка 40×40 мм + Пенофол + покрытие лаком OSMO 2 слоя.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Vnutrennyaya_otdelka_balkona_c5925c9216.png?updatedAt=2026-06-18T21%3A45%3A56.280Z',
        badge: 'Хит продаж',
      },
      {
        title: 'Вагонка + утепление Пеноплэксом',
        price: '2 700',
        desc: 'Пеноплэкс 50 мм в нишах обрешётки + Пенофол + вагонка «Экстра». Стена не промерзает при −40°C, нет конденсата и грибка.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_uteplenie_balkonov_i_lodzhij_300x300_dd1cc9fb2a.jpg?updatedAt=2026-06-18T21%3A46%3A55.398Z',
        badge: 'С утеплением',
      },
      {
        title: 'Вагонка + ламинат на пол',
        price: '3 200',
        desc: 'Стены и потолок — вагонка «Экстра». Пол — выравнивание стяжкой + ламинат 33 класс + плинтус. Полный готовый интерьер.',
        img: IMG_INTERIOR,
        badge: 'Комплект',
      },
      {
        title: 'Вагонка «под ключ» с электрикой',
        price: '4 500',
        desc: 'Отделка вагонкой + скрытая проводка в гофре + точечное LED-освещение + 2 розетки + пол. Готовая жилая комната с деревянным интерьером.',
        img: IMG_WARM_LIVING,
        badge: 'Всё включено',
      },
    ],
    StructureTab: [
      {
        tabName: 'Стены и потолок',
        title: 'Обшивка стен и потолка евровагонкой',
        desc: 'Монтаж на обрешётку 40×40 мм с Пенофолом и вентзазором 20 мм. Кляймеры скрывают крепёж. Стыки в EU-замок без щелей. Торцы — потолочный и напольный плинтус.',
        features: [
          'Обрешётка из сухого бруса с биозащитой Neomid',
          'Пенофол тип С — пароизоляция + теплоотражение',
          'Вентзазор 20 мм — дерево не гниёт и не темнеет',
        ],
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Vnutrennyaya_otdelka_balkona_c5925c9216.png?updatedAt=2026-06-18T21%3A45%3A56.280Z',
      },
      {
        tabName: 'С электрикой',
        title: 'Обшивка вагонкой со скрытой проводкой',
        desc: 'Прокладываем кабель ВВГнг 2×2,5 мм² в гофрорукаве за обрешёткой. Розетки, выключатели, LED-точечные светильники — всё скрыто. Чистый деревянный интерьер.',
        features: [
          'Скрытая проводка в гофре, пожаробезопасно',
          'Точечные LED 5 Вт — не нагревают дерево',
          'Розетки и выключатели в удобных местах',
        ],
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Provodka_i_mebel_na_balkon_00bad2d485.png?updatedAt=2026-06-18T21%3A46%3A06.978Z',
      },
      {
        tabName: 'С ламинатом',
        title: 'Евровагонка + ламинат: полная отделка',
        desc: 'Стены и потолок из вагонки «Экстра» + выравнивание пола нивелирным составом + ламинат 33 класс 8 мм + плинтус МДФ. Всё в один заход за 2 дня.',
        features: [
          'Выравнивание пола нивелирным составом до ±2 мм',
          'Ламинат 33 класс — выдерживает балконную нагрузку',
          'Плинтуса МДФ в цвет вагонки или контрастные',
        ],
        img: TAB_IMG_B,
      },
    ],
  },

  'krysha-na-balkon': {
    slug: 'krysha-na-balkon',
    name: 'Крыша на балкон последнего этажа в Омске',
    seoDescription:
      'Крыша на балкон последнего этажа в Омске: независимый металлокаркас из профтрубы 60×40 мм, поликарбонат 8–10 мм или металлочерепица, гидроизоляция примыкания. Монтаж 1–2 дня, гарантия 5 лет!',
    heroBadge: '🏗️ Последний этаж — крыша обязательна: снег, лёд, протечки',
    heroTitle: 'Крыша на балкон в Омске',
    heroTitleHighlight: 'защита от снега и протечек',
    heroDesc:
      'Устанавливаем крышу на балконы последнего этажа: надёжный каркас, гидроизоляция примыкания к стене и защита от снега и дождя. Конструкция не опирается на остекление. Бесплатный выезд на замер, завод на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('krysha-na-balkon', 'exteriors'),
    topCard1Title: 'Крыша на балкон 3 м (последний этаж)',
    topCard1Subtitle: 'Металлокаркас + поликарбонат + гидроизоляция',
    topCard1Price: 'от 25 500 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На металлокаркас, кровлю и гидроизоляцию примыкания',
    aboutBadge: 'Последний этаж — особый подход',
    aboutTitle: 'Крыша на балкон: защита плиты и имущества от омских зим',
    aboutImage: 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/osteklenie-balkona-v-khrushchevke-s-kryshej-300x300.jpg',
    seoText: `В Омске балкон последнего этажа — зона повышенного риска. Снеговая нагрузка по СП 20.13330 для Омска составляет 180 кг/м² (3-й снеговой район), а реальный снегопад в декабре–январе даёт 20–30 кг/м² за сутки. Без крыши снег накапливается на балконной плите, постепенно проникает в щели стеклопакетов, а весной таяние приводит к протечкам и разрушению бетона. Жильцы последних этажей отапливают «небо» — через незащищённую плиту уходит до 15% тепловой энергии всей квартиры.

Ключевой принцип нашей конструкции: крыша работает независимо от остекления. Металлокаркас из профильной трубы 60×40×2 мм крепится непосредственно к несущей стене здания анкерами 12×150 мм на глубину 150 мм. Уклон каркаса — 10–15° от стены (отвод воды и снега от остекления). Расчётная нагрузка на элементы — 350 кг/м², что трёхкратно перекрывает омскую снеговую норму. Остекление при этом несёт нагрузку только от своего веса — ничего дополнительного.

Для кровли используем многостенный поликарбонат толщиной 8–10 мм: он пропускает 60–75% света (прозрачный) или 30–40% (бронза). Теплопроводность поликарбоната 0,19 Вт/м·К — существенно ниже, чем у стекла (1,05 Вт/м·К). Срок службы поликарбоната Bayer (Германия) с UV-защитным слоем — 15–20 лет без пожелтения. Альтернатива — металлочерепица или профнастил C8 с полимерным покрытием Polyester, если закрытость важнее светопропускания.

Самое слабое место крыши — примыкание к стене. Здесь мы применяем двойную гидроизоляцию: сначала металлический фартук (оцинкованная сталь 0,5 мм) заводим в штробу на 30 мм и фиксируем дюбелями, затем поверх него наклеиваем битумно-полимерную ленту Nicoband шириной 150 мм. Такое примыкание выдерживает 100+ циклов замораживания-оттаивания без трещин и протечек.`,
    glazingCard: [
      {
        title: 'Крыша — поликарбонат 8 мм (прозрачный)',
        price: '8 500',
        desc: 'Металлокаркас профтруба 60×40 мм + поликарбонат Bayer 8 мм прозрачный. Пропускает 75% света, выдерживает 350 кг/м². Уклон 12°.',
        img: IMG_FACADE_EXT,
        badge: 'Со светом',
      },
      {
        title: 'Крыша — поликарбонат 10 мм (бронза)',
        price: '9 200',
        desc: 'Металлокаркас + поликарбонат 10 мм бронза. Снижает перегрев балкона летом, фильтрует UV. Эстетично и практично для жарких омских лет.',
        img: IMG_METAL_ROOF,
        badge: 'Защита от жары',
      },
      {
        title: 'Крыша — металлочерепица',
        price: '10 500',
        desc: 'Металлокаркас + металлочерепица Monterrey с Polyester-покрытием. Глухая кровля — максимальная защита от осадков и шума дождя. Срок службы 50 лет.',
        img: IMG_METAL_ROOF,
        badge: 'Максимальная защита',
      },
      {
        title: 'Крыша + козырёк над дверью',
        price: '12 500',
        desc: 'Полная крыша + дополнительный козырёк 600 мм перед балконной дверью. Выход из квартиры всегда сухой. Идеально для домов со сдвинутой балконной плитой.',
        img: CARD_IMG_B,
        badge: 'Сухой выход',
      },
    ],
    StructureTab: [
      {
        tabName: 'Поликарбонат (прозрачный)',
        title: 'Крыша из поликарбоната — свет и защита',
        desc: 'Многостенный поликарбонат 8–10 мм Bayer с UV-защитой. Пропускает свет, не пропускает снег и дождь. Металлокаркас 60×40 мм, независимый от остекления. Монтаж 1 день.',
        features: [
          'Независимый каркас — не нагружает остекление',
          'Уклон 12° — снег сходит самостоятельно',
          'Гидроизоляция примыкания Nicoband + металлофартук',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Металлочерепица (глухая)',
        title: 'Глухая крыша из металлочерепицы',
        desc: 'Металлочерепица на обрешётке 40×40 мм с гидроизоляционной плёнкой. Полная тишина от дождя. Пропускает нулевой свет — для балконов, где важна закрытость.',
        features: [
          'Полная звукоизоляция от осадков',
          'Срок службы металлочерепицы — 50 лет',
          'Подходит для любой геометрии балкона',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Козырёк (бюджетный)',
        title: 'Козырёк из поликарбоната — минимум вложений',
        desc: 'Лёгкий козырёк вынос 600–1 200 мм на стальных кронштейнах. Защищает от прямого дождя и снега, не закрывает балкон полностью. Монтаж за 2–3 часа.',
        features: [
          'Монтаж без сварки — на болтах и анкерах',
          'Вынос 600–1 200 мм по желанию',
          'Цена в 2 раза ниже полноценной крыши',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'vnutrennyaya-otdelka': {
    slug: 'vnutrennyaya-otdelka',
    name: 'Внутренняя отделка балконов и лоджий в Омске',
    seoDescription:
      'Внутренняя отделка балконов в Омске: ПВХ-панели 8–10 мм, евровагонка, МДФ, ламинат 33 класс. От 1 500 ₽/м². Комплексный ремонт стен, потолка и пола — монтаж за 1–3 дня, гарантия 5 лет!',
    heroBadge: '🎨 Комплексный ремонт: стены, потолок, пол — всё за один раз',
    heroTitle: 'Внутренняя отделка балконов в Омске',
    heroTitleHighlight: 'из холодной лоджии — уютное пространство',
    heroDesc:
      'Отделываем стены, потолок и пол: панели, вагонка, ламинат — под ваш бюджет и стиль. Скрываем трубы и проводку, делаем аккуратные откосы. Бесплатный замер, производство на ул. Гусарова, договор и гарантия 5 лет.',
    heroBackground: getDeterministicImage('vnutrennyaya-otdelka', 'interiors'),
    topCard1Title: 'Внутренняя отделка лоджии 3 м',
    topCard1Subtitle: 'Стены + потолок + пол — под ключ',
    topCard1Price: 'от 18 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На материалы, обрешётку и качество монтажа',
    aboutBadge: 'Три поверхности — одна бригада',
    aboutTitle: 'Внутренняя отделка — финальный штрих лоджии вашей мечты',
    aboutImage: 'https://balkonreshenie.ru/uploads/thumbnail_Vnutrennyaya_otdelka_balkona_c5925c9216.png?updatedAt=2026-06-18T21%3A45%3A56.280Z',
    seoText: `Внутренняя отделка балкона — это не просто «покрасить стены». В условиях омского климата бетонная лоджия испытывает ежегодный перепад 75°C: от −40°C зимой до +35°C летом. Отделочный материал обязан выдерживать такие нагрузки без трещин, вздутий и потери сцепления со стеной. Именно поэтому мы никогда не монтируем плитку и водоэмульсионную краску на балконных стенах без сплошного утепления — при промерзании они отслаиваются уже после первой зимы.

Для стен и потолка работаем с тремя материалами под разный бюджет и эстетику. ПВХ-панели 8–10 мм — самый практичный выбор: влагостойкость 100%, мойка обычной губкой, 120+ расцветок и фактур (белый, дерево, мрамор, однотонный). Монтируем на металлический профиль CD 60×27 мм с шагом 400 мм. МДФ-панели с ламинацией — промежуточный вариант: теплее на ощупь, чем ПВХ, богаче по дизайну, но требует хорошей пароизоляции во избежание разбухания. Евровагонка сосна — натуральный выбор: тепло, экологично, создаёт особую атмосферу. Подробнее — в разделе «Обшивка евровагонкой».

Потолок — отдельная история. Реечный алюминиевый подвесной потолок (системы Cesal или Албес) — идеальный вариант для балкона: алюминий не боится влаги и перепадов, монтируется за 2–3 часа, обеспечивает ровную поверхность без грунтования и шпаклёвки. Планки шириной 100 или 150 мм в белом или металлик-цвете.

Для пола — только 33 класс ламината или влагостойкий линолеум. 31-й класс (тот, что предлагают «сэкономить» некоторые подрядчики) истирается за один сезон на балконе: в обуви его истираемость вчетверо выше, чем в комнате. Мы укладываем ламинат Tarkett или Quick-Step 8–12 мм с подложкой 3 мм на предварительно выровненное основание (перепад не более 2 мм на 2 м). Плинтуса ПВХ с кабель-каналом — скрывают неровность стыка пола и стены и дают место для проводки.`,
    glazingCard: [
      {
        title: 'ПВХ-панели (стены + потолок)',
        price: '1 500',
        desc: 'ПВХ 8 мм на металлическом профиле CD 60. 120+ расцветок, влагостойкость 100%, мойка губкой. Монтаж стен и потолка лоджии 3 м за 1 день.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Vnutrennyaya_otdelka_balkona_c5925c9216.png?updatedAt=2026-06-18T21%3A45%3A56.280Z',
        badge: 'Хит продаж',
      },
      {
        title: 'МДФ-панели с ламинацией',
        price: '1 800',
        desc: 'МДФ 10 мм с ламинацией под дерево, камень или однотонные цвета. Теплее на ощупь, чем ПВХ. С обязательной Пенофол-пароизоляцией за обрешёткой.',
        img: IMG_INTERIOR,
        badge: 'Дизайнерский выбор',
      },
      {
        title: 'Ламинат 33 класс на пол',
        price: '900',
        desc: 'Ламинат Tarkett / Quick-Step 8–12 мм, 33 класс. Выравнивание нивелиром + подложка 3 мм + плинтус ПВХ с кабель-каналом. Монтаж за 3–4 часа.',
        img: IMG_WARM_LIVING,
        badge: 'Долговечный пол',
      },
      {
        title: 'Комплексная отделка «под ключ»',
        price: '3 200',
        desc: 'ПВХ стены + реечный алюминиевый потолок + ламинат 33 кл. + плинтуса + скрытая электрика. Лоджия 3 м за 2 дня — цена фиксируется в договоре.',
        img: CARD_IMG_D,
        badge: 'Всё за 2 дня',
      },
    ],
    StructureTab: [
      {
        tabName: 'Стены — ПВХ панели',
        title: 'Отделка стен ПВХ-панелями',
        desc: 'ПВХ-панели 8 мм на металлическом профиле CD 60 с шагом 400 мм. Скрываем неровности стен, трубы и проводку. Влагостойкость 100% — переживёт любые омские зимы.',
        features: [
          'Металлопрофиль CD 60 — не гниёт, не деформируется',
          'Пенофол за обрешёткой — пароизоляция и теплоотражение',
          '120+ расцветок: белый, дерево, мрамор, однотон',
        ],
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Vnutrennyaya_otdelka_balkona_c5925c9216.png?updatedAt=2026-06-18T21%3A45%3A56.280Z',
      },
      {
        tabName: 'Потолок реечный',
        title: 'Реечный алюминиевый потолок',
        desc: 'Подвесной реечный потолок Cesal из анодированного алюминия: ровная поверхность без шпаклёвки, влагостойкость 100%, монтаж за 2–3 часа. Интегрированные LED-точки.',
        features: [
          'Алюминий не реагирует на влагу и перепады t°',
          'Встроенные точечные светильники LED 5 Вт',
          'Монтаж без грунта и шпаклёвки — сразу финиш',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Пол — ламинат',
        title: 'Ламинат 33 класс на балконный пол',
        desc: 'Выравниваем основание нивелирным составом до ±2 мм, укладываем подложку 3 мм и ламинат 33 класс. Плинтус ПВХ с кабель-каналом скрывает стык и проводку.',
        features: [
          'Нивелирование пола — перепад не более 2 мм',
          'Ламинат 33 класс — в 4 раза износостойче 31 класса',
          'Плинтус ПВХ с кабель-каналом под проводку',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'kompleksnoe-uteplenie': {
    slug: 'kompleksnoe-uteplenie',
    name: 'Комплексное утепление балконов и лоджий в Омске',
    seoDescription:
      'Комплексное утепление балконов в Омске по технологии «термос»: Пеноплэкс 50 мм + Пенофол 5 мм + герметизация Стиз-А/Б. Лоджия +5°C при −40°C без обогревателя. От 1 200 ₽/м², гарантия 5 лет!',
    heroBadge: '🌡️ Технология «термос» — Пеноплэкс + Пенофол при −40°C',
    heroTitle: 'Комплексное утепление балконов в Омске',
    heroTitleHighlight: 'тёплая лоджия даже в сибирские морозы',
    heroDesc:
      'Утепляем пол, стены и потолок многослойной системой — сквозняки уходят, на стенах не появляется конденсат. Лоджия становится комфортной зимой и летом. Бесплатный выезд замерщика, завод по ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('kompleksnoe-uteplenie', 'interiors'),
    topCard1Title: 'Утепление лоджии 3 м «термос»',
    topCard1Subtitle: 'Пеноплэкс + Пенофол + герметизация',
    topCard1Price: 'от 14 400 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На утеплитель, пароизоляцию и герметизацию',
    aboutBadge: 'Климат Омска — требует профессионального подхода',
    aboutTitle: 'Утепление «термос» — инженерный ответ на омские морозы −40°C',
    aboutImage: 'https://balkonreshenie.ru/uploads/thumbnail_uteplenie_balkonov_i_lodzhij_300x300_dd1cc9fb2a.jpg?updatedAt=2026-06-18T21%3A46%3A55.398Z',
    seoText: `Зима в Омске — это не просто «холодно». Это 4–5 месяцев с устойчивыми морозами, где среднеянварская температура −18°C, а абсолютный минимум −40°C. В таких условиях балкон без утепления — это холодильник: плита промерзает, углы покрываются льдом, через остекление уходит тепло. Наша задача — создать тепловой барьер с суммарным R ≥ 2,0 м²·К/Вт (норма для жилых помещений Омска по СП 50.13330.2012). Этого достигает система «термос»: три слоя с разными физическими функциями.

Первый и главный слой — Пеноплэкс СТАНДАРТ толщиной 50 мм. Это экструдированный пенополистирол плотностью 35 кг/м³, коэффициент теплопроводности λ = 0,032 Вт/м·К, водопоглощение за 30 суток — 0,4% по объёму (для сравнения: обычный пенопласт — 4%). Пеноплэкс не гниёт, не служит питательной средой для плесени и не деформируется при температурах от −50°C до +75°C. Клеим его на специальный состав Технониколь CERESIT CT 85 + дополнительно фиксируем грибками-дюбелями 10×120 мм (5 штук на м²). Швы между плитами заполняем монтажной пеной — исключаем «мостики холода».

Второй слой — Пенофол тип С (алюминиевая фольга с двух сторон, пенополиэтилен 5 мм). Теплопроводность Пенофола 0,049 Вт/м·К, но его главная функция — отражение инфракрасного теплового излучения: отражающий слой возвращает обратно в помещение до 97% ИК-излучения. Пенофол крепим к Пеноплэксу скобами, стыки проклеиваем алюминиевым скотчем — пароизоляционный контур должен быть герметичен. Именно он не даёт влаге из жилого помещения конденсироваться внутри стены.

Третий слой — герметизация периметра. Все примыкания утеплителя к оконным рамам, стенам и плите обрабатываем составом Стиз-А (паропроницаемый наружный) и Стиз-Б (пароизоляционный внутренний) по ГОСТ 30971-2012. Это тот самый герметизирующий комплекс, который применяется при монтаже окон. Он сохраняет эластичность при −40°C и не трескается от температурных движений конструкции. Итог: при тестировании тепловизором через 24 часа после завершения работ — равномерная тепловая картина без холодных зон.`,
    glazingCard: [
      {
        title: 'Пеноплэкс 50 мм (стены + пол + потолок)',
        price: '1 200',
        desc: 'ЭППС Пеноплэкс 50 мм на клей + дюбели 10×120 мм. λ = 0,032 Вт/м·К, водопоглощение 0,4%. Не гниёт, не плесневеет. Закрывает 80% теплопотерь.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_uteplenie_balkonov_i_lodzhij_300x300_dd1cc9fb2a.jpg?updatedAt=2026-06-18T21%3A46%3A55.398Z',
        badge: 'Основа «термоса»',
      },
      {
        title: 'Пенофол тип С — пароизоляция',
        price: '900',
        desc: 'Фольгированный Пенофол 5 мм поверх Пеноплэкса. Отражает 97% ИК-излучения. Стыки — алюминиевый скотч. Герметичный пароизоляционный контур.',
        img: IMG_INSULATION,
        badge: 'Теплоотражение',
      },
      {
        title: 'Комплекс «термос» (Пеноплэкс + Пенофол)',
        price: '2 100',
        desc: 'Полная система: Пеноплэкс 50 мм + Пенофол тип С + герметизация швов Стиз-А/Б. R = 2,1 м²·К/Вт. При −40°C на улице на лоджии +5…+8°C.',
        img: CARD_IMG_A,
        badge: 'Полная система',
      },
      {
        title: 'Утепление + отделка ПВХ «под ключ»',
        price: '3 300',
        desc: '«Термос» + ПВХ-панели на стены и потолок + ламинат 33 кл. на пол. Готовая тёплая лоджия за 2–3 дня. Фиксированная смета в договоре.',
        img: IMG_WARM_LIVING,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Стены и потолок',
        title: 'Утепление стен и потолка Пеноплэксом',
        desc: 'Пеноплэкс 50 мм на клей + 5 дюбелей/м². Швы — монтажная пена. Поверх — Пенофол на скобах, стыки — алюминиевый скотч. Суммарный R стены с утеплением — 1,8 м²·К/Вт.',
        features: [
          'ЭППС 50 мм: теплопроводность 0,032 Вт/м·К',
          'Дюбели 10×120 мм — 5 штук на каждый м²',
          'Пенофол тип С — 97% отражение ИК-излучения',
        ],
        img: 'https://balkonreshenie.ru/uploads/thumbnail_uteplenie_balkonov_i_lodzhij_300x300_dd1cc9fb2a.jpg?updatedAt=2026-06-18T21%3A46%3A55.398Z',
      },
      {
        tabName: 'Пол балкона',
        title: 'Утепление пола лоджии',
        desc: 'Пеноплэкс 50 мм встык на клей + полиэтиленовая плёнка 200 мкм (гидробарьер) + цементная стяжка М150 толщиной 40 мм или сухая стяжка. Пол не промерзает при −40°C.',
        features: [
          'Пеноплэкс 50 мм — теплоизоляция под стяжку',
          'Гидробарьер 200 мкм — защита от воды из стяжки',
          'Стяжка М150 или сухая стяжка KNAUF',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Стыки и швы',
        title: 'Герметизация стыков — Стиз-А и Стиз-Б',
        desc: 'Все примыкания к раме, плите и стенам заделываем Стиз-А (снаружи, паропроницаемый) и Стиз-Б (изнутри, пароизоляционный). Эластичность при −40°C, 100+ циклов замораживания.',
        features: [
          'Стиз-А снаружи — отводит влагу из шва',
          'Стиз-Б изнутри — пароизоляционный барьер',
          'Алюминиевый скотч на стыках Пенофола',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'balkony-pod-klyuch': {
    slug: 'balkony-pod-klyuch',
    name: 'Балкон под ключ в Омске — от демонтажа до мебели',
    seoDescription:
      'Балкон под ключ в Омске: демонтаж → усиление плиты → остекление → утепление «термос» → внутренняя отделка → электрика → встроенная мебель. Один договор, фиксированная смета. Гарантия 5 лет!',
    heroBadge: '🔑 Один подрядчик — весь цикл от плиты до мебели в Омске',
    heroTitle: 'Балконы под ключ в Омске',
    heroTitleHighlight: 'один договор — готовая лоджия',
    heroDesc:
      'Делаем всё сами: остекление, утепление, отделку, электрику и мебель — без смены бригад и скрытых доплат. Фиксированная смета в договоре, сдаём готовую лоджию за несколько дней. Бесплатный замер, завод на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('balkony-pod-klyuch', 'interiors'),
    topCard1Title: 'Балкон «под ключ» 3 м',
    topCard1Subtitle: 'Остекление + утепление + отделка + электрика',
    topCard1Price: 'от 68 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На все виды работ и применённые материалы',
    aboutBadge: 'Полный цикл без субподряда',
    aboutTitle: 'Балкон под ключ — один договор и спокойный сон',
    aboutImage: 'https://balkonreshenie.ru/uploads/thumbnail_remont_balkona_pod_klyuch_296x300_89b3f234ec.png?updatedAt=2026-06-18T21%3A48%3A58.397Z',
    seoText: `Балкон «под ключ» — это не маркетинговый слоган, а конкретная технологическая последовательность из 8 этапов, где каждый зависит от предыдущего. Проблема большинства омских компаний: они берут остекление, а утепление и отделку отдают субподрядчикам, которые делают по своим стандартам. В итоге — три бригады, три сметы и ни один не несёт ответственность за стык своего и чужого. Мы выполняем всё своими силами, что даёт единую гарантию 5 лет на весь объём.

Первый этап — демонтаж и обследование. Снимаем старое остекление, убираем сгнившие деревянные рамы, простукиваем и осматриваем плиту и парапет. Фиксируем состояние арматуры, трещины и зоны разрушения бетона. По результатам составляем смету: если плита требует усиления, включаем это в договор — никаких «неожиданных» доплат после начала работ. Второй этап — усиление: металлокаркас парапета из профтрубы 40×20 мм, при необходимости укрепление плиты уголком 50×50×5 мм с анкерованием.

Третий этап — остекление. Устанавливаем ПВХ REHAU или VEKA 5-камерный с двухкамерным стеклопакетом (i-стекло + аргон). Монтажный шов по ГОСТ 30971-2012: ПСУЛ + пена Soudal + пароизоляционная лента. Четвёртый — утепление «термос»: Пеноплэкс 50 мм на клей + дюбели, Пенофол тип С, герметизация Стиз-А/Б по всему периметру. Пятый — отделка: ПВХ-панели или евровагонка на стены и потолок, ламинат 33 кл. на пол, реечный потолок из алюминия. Шестой — электрика: прокладка кабеля ВВГнг 2×2,5 мм² от квартирного щита в гофрорукаве, установка розеток, выключателей, LED-освещения по ПУЭ. Седьмой — встроенная мебель по индивидуальным размерам: шкафы, полки, рабочий стол, потолочная сушилка. Восьмой — уборка и сдача объекта клиенту.

Все работы фиксируются в договоре с детальной сметой до рубля. Мы не пишем «прочие работы» — каждая позиция расшифрована: вид материала, артикул, количество, единица измерения. Окончательная цена не изменится, если не меняется ТЗ. Это не обещание — это юридически закреплённое обязательство.`,
    glazingCard: [
      {
        title: 'Балкон под ключ — стандарт',
        price: '5 600',
        desc: 'Демонтаж + ПВХ REHAU 3-кам. + Пеноплэкс 50 мм + ПВХ-панели + ламинат 33 кл. Лоджия 3 м: фиксированная цена в договоре. Срок 3 рабочих дня.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_remont_balkona_pod_klyuch_296x300_89b3f234ec.png?updatedAt=2026-06-18T21%3A48%3A58.397Z',
        badge: 'Хит продаж',
      },
      {
        title: 'Балкон под ключ — комфорт',
        price: '6 800',
        desc: 'ПВХ REHAU 5-кам. + «термос» (Пеноплэкс + Пенофол) + евровагонка «Экстра» + ламинат + скрытая электрика 3 точки. Срок 4–5 дней.',
        img: IMG_WARM_LIVING,
        badge: 'Оптимально',
      },
      {
        title: 'Балкон под ключ — премиум',
        price: '8 500',
        desc: 'Всё из «комфорт» + встроенный шкаф по размерам + потолочная сушилка Лифт + LED-подсветка + реечный алюминиевый потолок Cesal. Срок 6–7 дней.',
        img: CARD_IMG_D,
        badge: 'Премиум',
      },
      {
        title: 'Усиление + демонтаж (отдельно)',
        price: '8 500',
        desc: 'Демонтаж старого остекления + металлокаркас парапета + вывоз мусора. Обязательный этап для хрущёвок и домов с разрушенным парапетом.',
        img: CARD_IMG_C,
        badge: 'Первый этап',
      },
    ],
    StructureTab: [
      {
        tabName: 'Этапы работ',
        title: '8 этапов балкона «под ключ»',
        desc: 'Демонтаж → обследование → усиление плиты и парапета → остекление ПВХ/алюминий → утепление «термос» → отделка стен/потолка/пола → электрика → встроенная мебель → уборка.',
        features: [
          'Единая смета без «прочих работ» и скрытых доплат',
          'Один прораб ведёт объект от демонтажа до сдачи',
          'Уборка и вывоз мусора включены в цену',
        ],
        img: 'https://balkonreshenie.ru/uploads/thumbnail_remont_balkona_pod_klyuch_296x300_89b3f234ec.png?updatedAt=2026-06-18T21%3A48%3A58.397Z',
      },
      {
        tabName: 'Электрика',
        title: 'Электрика на балконе по ПУЭ',
        desc: 'Прокладка ВВГнг 2×2,5 мм² от квартирного щита в гофрорукаве за обшивкой. Установка розеток, выключателей, LED-точечного освещения. Всё по ПУЭ — безопасно.',
        features: [
          'Кабель ВВГнг в гофрорукаве — пожаробезопасно',
          'LED 5 Вт точечные или LED-лента по периметру',
          '1–2 розетки + выключатель освещения',
        ],
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Provodka_i_mebel_na_balkon_00bad2d485.png?updatedAt=2026-06-18T21%3A46%3A06.978Z',
      },
      {
        tabName: 'Встроенная мебель',
        title: 'Встроенные шкафы и полки по размерам',
        desc: 'Замеряем лоджию с точностью до мм, проектируем шкаф, тумбу или рабочий стол под конкретную планировку. Корпус — ЛДСП 18 мм, фасады — МДФ или ПВХ.',
        features: [
          'Шкаф или тумба по точным замерам лоджии',
          'Потолочная сушилка Лифт — удобно и практично',
          'Рабочий стол с полками — кабинет на балконе',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  // ── БАТЧ №2: ТИПЫ КОНСТРУКЦИЙ И ВЫНОС ────────────────────────────────────

  'pryamoy-balkon': {
    slug: 'pryamoy-balkon',
    name: 'Остекление прямого балкона в Омске',
    seoDescription:
      'Остекление прямого балкона в Омске — ПВХ REHAU или алюминий Slidors, монтаж за 4–6 часов. Серии 1-464, П-44, П-3, 1-447. Стартовый профиль 3 мм, шов по ГОСТ 30971. Гарантия 5 лет!',
    heroBadge: '🏠 65% всех заказов в Омске — прямые балконы панельных домов',
    heroTitle: 'Остекление прямого балкона в Омске',
    heroTitleHighlight: 'классическая планировка — быстрый монтаж',
    heroDesc:
      'Остекляем фронтальную часть прямого балкона и закрываем боковые стены — работаем с панельными и кирпичными домами. Тёплое или холодное остекление на выбор. Бесплатный замер, производство на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('pryamoy-balkon', 'exteriors'),
    topCard1Title: 'Остекление прямого балкона 3 м',
    topCard1Subtitle: 'ПВХ 5-камерный или алюминий Slidors + монтаж',
    topCard1Price: 'от 36 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На профиль, стартовый профиль, шов по ГОСТ 30971-2012',
    aboutBadge: 'Самая частая конструкция в Омске',
    aboutTitle: 'Прямой балкон — проверенное решение для панельных домов',
    aboutImage: DEFAULT_ABOUT_IMG,
    seoText: `Прямой балкон — самая массовая конструкция в Омске, и именно здесь совершается большинство монтажных ошибок. Главная из них: крепление рамы непосредственно к бетонному или кирпичному парапету без промежуточного стального стартового профиля. Через 2–3 омские зимы с перепадами −40°C/+35°C парапет дёргает монтажный шов, рама перекашивается, створки начинают задувать. Мы крепим каждую раму через стальной стартовый профиль 3 мм (сталь С245), приваренный к закладным анкерам М10 в парапете — по одному анкеру на каждые 600 мм периметра. Сварочные швы — ГОСТ 14771-76, полуавтоматическая сварка в защитном газе CO₂/Ar, катет шва 4 мм. Такое основание передаёт нагрузку на парапет равномерно и не даёт раме смещаться при тепловом расширении.

Выбор профиля зависит от задачи. Для холодного остекления (защита от ветра, пыли и косого дождя — актуально для омских степных ветров 6–10 м/с) — алюминий Slidors 1,2 мм, масса рамы 6–8 кг/пм, монтаж за 3–4 часа. Для тёплого остекления под последующее утепление — ПВХ REHAU Blitz 3-камерный (60 мм, Rf=0,62 м²·К/Вт) или REHAU Grazio 5-камерный (82 мм, Rf=1,06 м²·К/Вт). Разница в стоимости — 18–22%, разница в теплоизоляции — критична при омских морозах: 3-камерный промерзает при −28°C, 5-камерный держит до −45°C без конденсата на откосах.

Боковые стены прямого балкона — часто упускаемый момент. Необработанные торцы остекления продуваются даже при хорошем уплотнителе рамы. Закрываем боковины одним из трёх способов: сэндвич-панель 24 мм «стеклопластик/ПЭТ-пена/стеклопластик» с теплопроводностью 0,035 Вт/м·К (лучший вариант), глухая ПВХ-заглушка с уплотнителем (бюджетный вариант) или дополнительная глухая рама для любителей бокового освещения. Все торцевые швы заполняем нейтральным силиконом Soudal Silirub-N, рабочий диапазон −40°C до +150°C, стойкость к UV-излучению 3 000 часов.

Трёхслойный монтажный шов по ГОСТ 30971-2012 — не опция, а стандарт. Снаружи: ПСУЛ (предварительно сжатая уплотнительная лента) 30/10 мм — компенсирует температурные расширения профиля. Средний слой: монтажная пена Soudal Pro 25 Plus, теплопроводность 0,040 Вт/м·К, адгезия к бетону 0,2 МПа. Изнутри: пароизоляционная лента ИЛЬБРУК 600. Суммарное сопротивление монтажного шва — не менее 0,8 м²·К/Вт. Нарушение любого слоя сокращает срок службы шва с 20 до 3–5 лет.`,
    glazingCard: [
      {
        title: 'Алюминий Slidors — холодный',
        price: '2 700',
        desc: 'Раздвижной алюминий Slidors на прямой балкон. Масса рамы 6 кг/пм. EPDM уплотнитель, ветрозащита до 28 м/с. Монтаж 3–4 часа.',
        img: '/images/prices/pryamoj/price-1.jpg',
        alt: 'Вариант остекления прямого балкона в Омске: цена за квадратный метр',
        badge: 'Самый лёгкий',
      },
      {
        title: 'ПВХ REHAU 3-камерный — тёплый',
        price: '3 200',
        desc: 'Профиль 60 мм, Rf=0,62 м²·К/Вт. Двухкамерный стеклопакет 32 мм. Стартовый профиль 3 мм на анкерах М10. Монтаж за 4–6 часов.',
        img: '/images/prices/pryamoj/price-2.jpg',
        alt: 'Вариант остекления прямого балкона в Омске: цена за квадратный метр',
        badge: 'Хит продаж',
      },
      {
        title: 'ПВХ REHAU 5-камерный — максимум тепла',
        price: '3 800',
        desc: 'Профиль 82 мм, Rf=1,06 м²·К/Вт. Стеклопакет с i-стеклом + аргон. Не промерзает при −45°C. Идеально под присоединение к комнате.',
        img: '/images/prices/pryamoj/price-3.jpg',
        alt: 'Вариант остекления прямого балкона в Омске: цена за квадратный метр',
        badge: 'Для Омска',
      },
      {
        title: 'Прямой балкон под ключ',
        price: '4 700',
        desc: 'ПВХ 5-камерный + Пеноплэкс 50 мм + ПВХ-панели + ламинат 33 кл. Готовая тёплая комната за 2–3 дня. Фиксированная смета.',
        img: '/images/prices/pryamoj/price-4.jpg',
        alt: 'Вариант остекления прямого балкона в Омске: цена за квадратный метр',
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Серия П-44 / П-3',
        title: 'Прямой балкон в панельных домах П-44 и П-3',
        desc: 'Стандартный размер: ширина 2 700–3 200 мм, высота парапета 900–1 050 мм. ПВХ-рама крепится через стальной стартовый профиль на закладные М10. Монтаж за полдня.',
        features: [
          'Стартовый профиль 3 мм — исключает перекос рамы',
          'Сэндвич-панели 24 мм на боковины',
          'Уборка и вывоз мусора включены',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Серия 1-464 (хрущёвка)',
        title: 'Прямой балкон в хрущёвке 1-464',
        desc: 'Парапет высотой 700–800 мм: перед ПВХ поднимаем до 900 мм металлокаркасом или устанавливаем алюминий без изменения высоты. Нагрузка на плиту не превышает 200 кг.',
        features: [
          'Алюминий Slidors без усиления — безопасно',
          'ПВХ только после подъёма парапета до 900 мм',
          'Монтаж за 1 день без выселения',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Кирпичный дом',
        title: 'Прямой балкон в кирпичном доме',
        desc: 'Кирпичный парапет обеспечивает надёжное основание для ПВХ. Используем нейлоновые дюбели 10×100 мм в кирпич и стальные пластины крепления шириной 40 мм.',
        features: [
          'Дюбели 10×100 мм в кирпич с шагом 600 мм',
          'Стальная крепёжная пластина 40×4 мм',
          'Шов ПСУЛ + пена + пароизоляция по ГОСТ',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'g-obraznyj-balkon': {
    slug: 'g-obraznyj-balkon',
    name: 'Г-образный балкон в Омске — остекление угловых конструкций',
    seoDescription:
      'Г-образное остекление балконов в Омске: угловой профиль под реальный градус стыка (±0,5°), химические анкеры Hilti в несущую стену, герметизация Soudal PU-25LM. Монтаж за 1 день, гарантия 5 лет!',
    heroBadge: '📐 Угловой стык под точный градус — не стандарт 90°, а ваш угол',
    heroTitle: 'Остекление Г-образного балкона в Омске',
    heroTitleHighlight: 'больше света в угловой квартире',
    heroDesc:
      'Две стеклянные секции — фронтальная и боковая — дают широкий обзор и наполняют комнату светом. Популярное решение для хрущёвок и новостроек. Бесплатный выезд на замер, завод по ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('g-obraznyj-balkon', 'exteriors'),
    topCard1Title: 'Г-образное остекление (фронт 3 м + бок 1,5 м)',
    topCard1Subtitle: '2 секции + угловой соединитель + монтаж',
    topCard1Price: 'от 42 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На профиль, угловой соединитель, крепление и шов',
    aboutBadge: 'Точность стыка решает всё',
    aboutTitle: 'Г-образный балкон: угловой соединитель под реальный градус',
    aboutImage: DEFAULT_ABOUT_IMG,
    seoText: `Г-образный балкон кажется простым — две секции, угол. Но именно угловой стык — самое уязвимое место конструкции. В Омске из 200 Г-образных балконов, которые мы обследовали в рамках ремонтных заявок, 68% имели продувание именно в угловом соединении. Причина всегда одна: монтажники взяли стандартный угловой коннектор 90°, тогда как реальный угол балкона был 88° или 93° — погрешность строительства панельных домов. Разница в 2° даёт щель 3–5 мм по всей высоте стыка. Через неё за зиму уходит 15–20% теплопотерь всего балкона. Наш замерщик фиксирует угол угломером с ценой деления 0,5°, и угловой профиль изготавливается под конкретный градус.

Боковая секция Г-образного балкона примыкает к несущей стене здания. В панельных и кирпичных домах Омска несущие стены — это железобетонные панели толщиной 160–220 мм или кирпич толщиной 380–510 мм. Сверлить в несущей стене глубже 50 мм без согласования с управляющей компанией и расчётом нельзя: риск попасть в арматуру. Мы применяем химические анкеры Hilti HIT-RE 500 V4 в отверстиях ∅12 мм глубиной 45 мм — они развивают усилие вырывания 12 кН при глубине 40 мм, нагрузка на срез 8 кН. Для ПВХ-рамы весом 100–150 кг это трёхкратный запас прочности.

Угловой соединительный профиль испытывает ветровые нагрузки с двух направлений одновременно. По СП 20.13330 ветровое давление в Омске (I ветровой район) — w₀ = 0,23 кПа. На угловых квартирах Левого берега и микрорайона Амурский, где фасады открыты степным ветрам, динамическая составляющая на 9–12 этажах достигает 0,38–0,45 кПа. Угловой профиль из стали С245, толщина стенки 3 мм, с двумя рёбрами жёсткости 40×4 мм выдерживает эту нагрузку с коэффициентом запаса 2,5. После сварки швов — визуальный контроль по ГОСТ 3242-79.

Уплотнение углового стыка — двухкомпонентная система. Наружный слой: полиуретановый герметик Soudal PU-25LM, устойчивый к озону, УФ и температурам от −40°C до +90°C. Внутренний слой: нейтральный силикон Soudal Silirub-S, не атакует ПВХ. Между слоями — вспененный полиэтиленовый шнур ∅12 мм как подложка-ограничитель. Такой трёхкомпонентный шов выдерживает удлинение 300% без разрыва — достаточно для суточных температурных деформаций Г-образной конструкции в омском климате.`,
    glazingCard: [
      {
        title: 'Алюминий Г-образный (холодный)',
        price: '3 400',
        desc: 'Slidors 2 секции + угловой соединитель под реальный угол ±0,5°. Масса 12–16 кг. Химические анкеры Hilti в несущую стену.',
        img: CARD_IMG_B,
        badge: 'Лёгкая конструкция',
      },
      {
        title: 'ПВХ Г-образный — 5-камерный',
        price: '4 200',
        desc: 'REHAU Grazio 82 мм, 2 секции + угловой стальной профиль 3 мм. Стеклопакет i-стекло + аргон. Rf=1,06 м²·К/Вт на обеих секциях.',
        img: CARD_IMG_A,
        badge: 'Хит для угловых',
      },
      {
        title: 'Г-образный + усиление парапета',
        price: '5 200',
        desc: 'ПВХ Г-образный + металлокаркас парапета обеих секций из профтрубы 40×20 мм. Для хрущёвок с ослабленным парапетом.',
        img: CARD_IMG_C,
        badge: 'С усилением',
      },
      {
        title: 'Г-образный под ключ',
        price: '6 800',
        desc: 'ПВХ 5-кам. + утепление «термос» на двух секциях + ПВХ-панели + ламинат. Угловая комната с панорамным видом за 3–4 дня.',
        img: CARD_IMG_D,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Точный замер угла',
        title: 'Как замеряем угол Г-образного балкона',
        desc: 'Угломер с ценой деления 0,5°. Фиксируем реальный угол между секциями, длину каждой секции и высоту парапета в 3 точках. Угловой профиль — строго под ваш градус.',
        features: [
          'Угломер ±0,5° — никакого «на глаз»',
          'Производство углового коннектора за 3–5 дней',
          'Проверка стыка на продувание после монтажа',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Крепление к несущей стене',
        title: 'Химические анкеры Hilti в несущую стену',
        desc: 'Боковая рама крепится к несущей стене химическими анкерами Hilti HIT-RE 500 V4 в отверстия ∅12 мм глубиной 45 мм. Усилие вырывания 12 кН — трёхкратный запас для рамы 150 кг.',
        features: [
          'Химанкер Hilti — глубина 45 мм, без риска арматуры',
          'Усилие вырывания 12 кН (запас ×3 от нагрузки)',
          'Не требует согласования: глубина до 50 мм',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Ветровая нагрузка',
        title: 'Ветровая нагрузка на Левом берегу Омска',
        desc: 'I ветровой район, w₀=0,23 кПа. Угловые квартиры Левого берега и Амурского на 9–12 этажах испытывают до 0,45 кПа. Угловой профиль С245 3 мм выдерживает с запасом 2,5.',
        features: [
          'Расчёт по СП 20.13330 для Омска',
          'Стальной угол С245, стенка 3 мм, рёбра жёсткости',
          'Сварка ГОСТ 14771-76, контроль швов',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'p-obraznyj-balkon': {
    slug: 'p-obraznyj-balkon',
    name: 'П-образный балкон в Омске — трёхстороннее остекление 180°',
    seoDescription:
      'П-образный балкон в Омске: три секции остекления, обзор 180°. Обследование плиты, металлокаркас усиления, два угловых соединителя под точный градус. Гарантия 5 лет, монтаж 1–2 дня!',
    heroBadge: '🌅 180° обзора — три секции, два угловых стыка, одна гарантия',
    heroTitle: 'Остекление П-образного балкона в Омске',
    heroTitleHighlight: 'панорамный обзор на три стороны',
    heroDesc:
      'Трёхстороннее остекление открывает вид почти на полкруга — перед монтажом проверяем состояние плиты и при необходимости усиливаем основание. Бесплатный замер, изготовление на заводе по ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('p-obraznyj-balkon', 'exteriors'),
    topCard1Title: 'П-образное остекление (фронт 3 м + два бока по 1,2 м)',
    topCard1Subtitle: '3 секции + 2 угловых стыка + обследование плиты',
    topCard1Price: 'от 58 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На три секции, угловые соединители и усиление',
    aboutBadge: 'Трёхстороннее остекление — инженерный подход',
    aboutTitle: 'П-образный балкон: панорама требует правильного расчёта',
    aboutImage: 'https://omsk.oknamydom.ru/wp-content/uploads/2019/04/vynos-ostekleniya-balkona-750x750.jpg',
    seoText: `П-образный балкон — это мечта владельца угловой квартиры и головная боль неопытного монтажника. Три секции остекления создают суммарную нагрузку на балконную плиту 55–80 кг только от рам плюс стекло. Добавьте снеговую нагрузку Омска — 180 кг/м² (3-й снеговой район по СП 20.13330) и эксплуатационную нагрузку — и для типовых хрущёвок серий 1-447 и 1-464 получится цифра, превышающая расчётный предел плиты 200 кг. Именно поэтому мы никогда не монтируем П-образное остекление без предварительного обследования. Мастер осматривает плиту, простукивает её, проверяет состояние арматуры в зонах сколов. По результатам рекомендует: алюминий без усиления (54–72 кг для П-образного), ПВХ с обязательным металлокаркасом, или отказ от боковых секций при критическом состоянии плиты.

Два угловых стыка — вдвое больше риска продувания по сравнению с Г-образным. Оба угла требуют индивидуальных коннекторов под реальный градус. В П-образных балконах Омска мы встречаем асимметрию: правый угол 91,5°, левый — 88,5°. Стандартные коннекторы 90° не подойдут ни для одного из них. Производство двух угловых профилей под конкретный балкон занимает 3–5 рабочих дней. Стоимость изготовления нестандартных угловых профилей включена в общую цену — не выставляем как допработы.

Ветровая нагрузка на П-образную конструкцию действует в трёх направлениях: перпендикулярно фронтальной секции, перпендикулярно каждой боковой секции и под углом 45° в угловые стыки. При ветре 12 м/с (характерен для Левого берега Омска весной и осенью) суммарная горизонтальная сила на П-образную конструкцию 3×1,2 м составляет около 840 Н. Крепление рамы рассчитываем с коэффициентом надёжности 1,5: анкеры М10 с шагом 500 мм по всему периметру трёх секций.

Стыки П-образного остекления герметизируем комплексно. Наружные угловые швы: ПСУЛ 30×10 мм в притвор + Soudal PU-25LM снаружи. Внутренние угловые зазоры: вспененный шнур ∅10 мм + нейтральный силикон Soudal Silirub-N. Горизонтальный примыкающий шов рамы к плите потолка: Стиз-А (паропроницаемый). Горизонтальный шов рамы к парапету: монтажная пена + Стиз-Б изнутри. После монтажа проверяем каждый шов аэродинамическим дымогенератором — видим любое продувание.`,
    glazingCard: [
      {
        title: 'Алюминий П-образный (холодный)',
        price: '3 800',
        desc: 'Slidors 3 секции + 2 угловых коннектора под реальный градус. Масса 20–28 кг. Не требует усиления плиты в большинстве хрущёвок.',
        img: CARD_IMG_B,
        badge: 'Без усиления',
      },
      {
        title: 'ПВХ П-образный + усиление плиты',
        price: '4 600',
        desc: 'REHAU 5-камерный 3 секции + 2 угловых профиля С245 + металлокаркас парапета 40×20 мм. Обследование плиты включено в цену.',
        img: CARD_IMG_A,
        badge: 'Безопасно',
      },
      {
        title: 'ПВХ П-образный панорамный',
        price: '5 800',
        desc: 'П-образный витраж от пола до потолка: три секции REHAU 82 мм + закалённое стекло 8 мм в нижней части + усиление парапета металлокаркасом.',
        img: CARD_IMG_D,
        badge: 'Панорама 180°',
      },
      {
        title: 'П-образный под ключ',
        price: '7 500',
        desc: 'Обследование + усиление + ПВХ три секции + «термос» + отделка + пол. Готовая жилая комната с видом на 180° за 4–5 рабочих дней.',
        img: CARD_IMG_C,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Обследование плиты',
        title: 'Обязательное обследование перед П-образным остеклением',
        desc: 'Замерщик простукивает плиту, осматривает торцы, фиксирует состояние арматуры в зонах сколов. По результатам — рекомендация: алюминий, ПВХ с усилением или отказ от боковых секций.',
        features: [
          'Обследование бесплатно при заказе остекления',
          'Алюминий безопасен без усиления — 20–28 кг',
          'ПВХ только после металлокаркаса парапета',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Два угловых стыка',
        title: 'Производство двух угловых коннекторов',
        desc: 'Оба угла в П-образном балконе замеряем раздельно — они почти никогда не равны 90°. Каждый коннектор из стали С245 3 мм изготавливается на заводе под конкретный градус за 3–5 дней.',
        features: [
          'Два угла замеряем угломером ±0,5° раздельно',
          'Производство 2 коннекторов — без доплат',
          'Герметизация Soudal PU-25LM + шнур ∅10 мм',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Три секции — расчёт нагрузки',
        title: 'Расчёт нагрузки на плиту для трёх секций',
        desc: 'Масса трёх рам ПВХ 82 мм с двухкамерным стеклопакетом — 55–80 кг. Снег в Омске — до 180 кг/м². Суммируем, сравниваем с расчётной нагрузкой плиты (150–200 кг для хрущёвок).',
        features: [
          'Подробный расчёт нагрузки в смете',
          'Анкеры М10 шаг 500 мм по всем трём секциям',
          'Металлокаркас усиления при необходимости',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'erkernyj-balkon': {
    slug: 'erkernyj-balkon',
    name: 'Эркерный балкон в Омске — остекление нестандартной геометрии',
    seoDescription:
      'Остекление эркерных балконов в Омске: многоугольные и трапециевидные формы, индивидуальный проект по точным замерам. Угловые сварные профили под каждый градус, закалённое стекло. Гарантия 5 лет!',
    heroBadge: '✨ Эркер — многоугольная геометрия, индивидуальный проект для каждого',
    heroTitle: 'Остекление эркерного балкона в Омске',
    heroTitleHighlight: 'индивидуальный проект под вашу форму',
    heroDesc:
      'Эркер — нестандартная геометрия, поэтому делаем точный замер и изготавливаем конструкцию под каждый угол и скругление фасада. Бесплатный выезд замерщика, производство на ул. Гусарова, договор и гарантия 5 лет.',
    heroBackground: getDeterministicImage('erkernyj-balkon', 'interiors'),
    topCard1Title: 'Остекление эркера (5 граней)',
    topCard1Subtitle: 'Индивидуальный проект + производство + монтаж',
    topCard1Price: 'от 48 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На все секции, угловые профили и монтаж',
    aboutBadge: 'Нестандартная геометрия — наша специализация',
    aboutTitle: 'Эркерный балкон: точность замера — это и есть качество',
    aboutImage: CARD_IMG_D,
    seoText: `Эркер в архитектуре — это выступающий за плоскость фасада объём с тремя и более гранями. В Омске эркерные балконы характерны для домов серий 111-97, П-7/17 и для элитных новостроек ЖК «Флагман», «Маяк», «Арена». Остекление такого балкона — это мини-проект: нельзя взять готовую раму со склада, нужно спроектировать каждую секцию и угловой соединитель под конкретные размеры. Первый этап — геодезический замер: фиксируем длину каждой грани (с точностью ±2 мм), угол между гранями (с точностью ±0,5°), высоту и отклонение плоскостей от вертикали. На эркере с 5 гранями это 5 размеров, 4 угла и 10 высотных отметок — итого 19 параметров для производственного чертежа.

Угловые соединительные профили для эркера испытывают бо́льшие нагрузки, чем для Г- или П-образного балкона. В секторе 120–135° (типичные углы эркера) ветровая нагрузка на угловой профиль действует под нестандартным углом — не 90°, как в прямом балконе. Применяем метод параллелограмма сил: рассчитываем проекции ветровой силы на каждый угловой профиль по СП 20.13330. Для Омска (I ветровой район, высота здания 20–40 м) расчётная нагрузка на угловой профиль эркера — 420–680 Н. Используем сталь С345 (повышенная прочность) вместо С245, толщина стенки 4 мм, рёбра жёсткости 50×5 мм. Сварка ручная дуговая ГОСТ 5264-80 электродами УОНИ-13/55 с контролем швов по ГОСТ 3242-79.

Для эркеров современных новостроек широко применяем безрамные и минимально-рамные системы: стеклянные панели Triplex 8.4.8 в точечных зажимах без видимого вертикального профиля. Это усиливает «парящий» эффект эркера, максимизирует световой поток. Несущая способность Triplex 8.4.8 — разрушающая нагрузка 2 800 Н/м² при пролёте 1 500 мм, что перекрывает омское ветровое давление с коэффициентом 6,3. Крепежи из нержавеющей стали AISI 316L — устойчивы к коррозии в условиях омского промышленного воздуха с повышенным содержанием SO₂.

Герметизация многоугольного эркера — самый трудоёмкий этап. Каждый угол: вспененный шнур ∅10 мм + нейтральный силикон Soudal Silirub-N изнутри + Soudal PU-25LM снаружи. Горизонтальный шов основания: гидроизоляционный состав Технониколь HYPERDESMO -AD плюс герметизирующая лента PLANIFLEX. Общий расход герметика на типовой 5-гранный эркер — 3–4 картриджа. Проверка результата: аэродинамический дымогенератор обходит все швы — нулевое продувание при скорости воздуха 5 м/с является нашим внутренним стандартом приёмки.`,
    glazingCard: [
      {
        title: 'Эркер алюминий (холодный)',
        price: '4 100',
        desc: 'Алюминий Slidors по всем граням эркера + угловые коннекторы под точные углы. Лёгкая конструкция, 120+ лет службы без коррозии.',
        img: CARD_IMG_B,
        badge: 'Холодный',
      },
      {
        title: 'Эркер ПВХ 5-камерный (тёплый)',
        price: '5 500',
        desc: 'REHAU Grazio 82 мм по граням + угловые профили С345 4 мм. Стеклопакет i-стекло + аргон. Rf=1,06 м²·К/Вт на каждой секции.',
        img: CARD_IMG_A,
        badge: 'Тёплый',
      },
      {
        title: 'Эркер безрамный (Triplex)',
        price: '7 200',
        desc: 'Стекло Triplex 8.4.8 в точечных зажимах AISI 316L без вертикальных профилей. Несущая способность 2 800 Н/м². Премиум-эстетика.',
        img: CARD_IMG_D,
        badge: 'Безрамный',
      },
      {
        title: 'Эркер под ключ',
        price: '9 800',
        desc: 'Замер + проект + производство + монтаж + утепление + отделка изнутри. Полная готовность помещения с панорамным видом.',
        img: CARD_IMG_C,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Геодезический замер',
        title: 'Точный замер 19 параметров эркера',
        desc: 'Длина каждой грани ±2 мм, угол между гранями ±0,5°, высота в трёх точках и отклонение плоскостей. Для 5-гранного эркера — 19 параметров производственного чертежа.',
        features: [
          'Геодезический инструмент — точность ±2 мм',
          'Проект с чертежами — за 1–2 рабочих дня',
          'Производство секций на заводе в Омске',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Угловые профили С345',
        title: 'Сварные угловые профили сталь С345',
        desc: 'Для эркеров применяем С345 (а не С245): предел текучести 345 МПа против 245. Стенка 4 мм, рёбра 50×5 мм. Сварка УОНИ-13/55, контроль ГОСТ 3242-79.',
        features: [
          'Сталь С345 — на 40% прочнее С245',
          'Ручная дуговая сварка ГОСТ 5264-80',
          'Катет шва 5 мм, контроль визуальный',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Безрамный вариант',
        title: 'Безрамный эркер на точечных зажимах',
        desc: 'Triplex 8.4.8 мм в точечных зажимах AISI 316L без видимых вертикальных профилей. Разрушающая нагрузка 2 800 Н/м², запас к ветровому давлению ×6,3.',
        features: [
          'Triplex 8.4.8 — безосколочное разрушение',
          'Зажимы AISI 316L — не корродируют в Омске',
          'Максимальный световой поток без рам',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'lodzhiya-3-metra': {
    slug: 'lodzhiya-3-metra',
    name: 'Лоджия 3 метра в Омске — остекление и отделка под ключ',
    seoDescription:
      'Остекление и отделка лоджии 3 метра в Омске: ПВХ REHAU 5-камерный, утепление «термос» Пеноплэкс 50 мм, ПВХ-панели, ламинат 33 класс. От 3 200 ₽/м². Монтаж 1–3 дня, гарантия 5 лет!',
    heroBadge: '📏 3-метровая лоджия — хит омского рынка, 65% всех заказов',
    heroTitle: 'Остекление лоджии 3 метра в Омске',
    heroTitleHighlight: 'самый популярный размер — под ключ',
    heroDesc:
      'Типовая трёхметровая лоджия в панельном доме: остекление, утепление и отделка одной бригадой. Монтаж за один рабочий день. Бесплатный замер, завод по ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('lodzhiya-3-metra', 'interiors'),
    topCard1Title: 'Лоджия 3 м под ключ',
    topCard1Subtitle: 'Остекление + утепление + отделка + пол',
    topCard1Price: 'от 38 400 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На все виды работ и применённые материалы',
    aboutBadge: 'Самый частый заказ в Омске',
    aboutTitle: 'Лоджия 3 м — знаем каждую серию и каждый нюанс',
    aboutImage: DEFAULT_ABOUT_IMG,
    seoText: `3-метровая лоджия — это 65% наших заказов. За 15 лет работы мы остеклили более 3 000 таких лоджий в Омске и знаем особенности каждой серии: ширину парапета, типовой угол боковин, расположение вентиляционных каналов и места залегания арматуры. Для домов серии П-44 ширина лоджии — 2 700 мм, для серии П-3 — 3 000 мм, для 1-464 — 2 830 мм. Разница небольшая, но именно она определяет размер рамы и итоговую цену. Поэтому мы не называем «примерную цену» по телефону — называем точную после бесплатного замера.

Самая распространённая ошибка при остеклении 3-метровой лоджии — установка одностворчатой рамы без разделения на секции. Рама 3 000×1 500 мм с двухкамерным стеклопакетом весит 68–82 кг. При монтаже такой рамы нагрузка на парапет концентрируется в двух точках — местах крепления. Со временем парапет в этих точках начинает крошиться. Мы делим 3-метровую лоджию на 2 секции по 1 400–1 500 мм: распашная (открывающаяся) и глухая или две поворотно-откидные. Масса каждой секции — 32–38 кг, крепление равномерное.

Для 3-метровой лоджии под утепление и отделку ключевой параметр — правильная последовательность работ. Многие делают наоборот: сначала отделку, потом замечают, что рама продувает. Наша последовательность: 1) монтаж рамы с трёхслойным швом (ПСУЛ + пена + пароизоляция); 2) утепление Пеноплэксом 50 мм с запенкой швов; 3) Пенофол тип С + алюминиевый скотч на стыках; 4) обрешётка из металлопрофиля CD 60; 5) ПВХ-панели или евровагонка; 6) реечный потолок; 7) стяжка + ламинат. Нарушение порядка ведёт к промерзанию и конденсату за финишной отделкой.

Электрика на 3-метровой лоджии — опция, которую 80% наших клиентов добавляют, уже видя готовую комнату. Ставим розетку 2P+PE под обогреватель или сушилку (2,2 кВт), розетку для телефона/зарядки и два-три точечных LED 5 Вт. Всё в гофрорукаве ∅20 мм за отделкой. Кабель ВВГнг 3×2,5 мм² от квартирного щита — допускает нагрузку до 3,5 кВт. Если добавить сразу при монтаже — экономия на штроблении и повторной отделке около 4 000–6 000 руб.`,
    glazingCard: [
      {
        title: 'Холодное остекление лоджии 3 м',
        price: '3 200',
        desc: 'Алюминий Slidors, 2 секции. Масса рамы 12–15 кг. Защита от ветра, пыли, дождя. Монтаж за 3–4 часа. Идеально для хрущёвок без усиления.',
        img: CARD_IMG_B,
        badge: 'Экономично',
      },
      {
        title: 'Тёплое остекление ПВХ 5-камерный',
        price: '3 800',
        desc: 'REHAU Grazio 82 мм, 2 секции + 1 поворотно-откидная. Стеклопакет i-стекло + аргон. Rf=1,06 м²·К/Вт. Не промерзает при −45°C.',
        img: CARD_IMG_A,
        badge: 'Хит продаж',
      },
      {
        title: 'Тёплое остекление + утепление «термос»',
        price: '4 500',
        desc: 'ПВХ REHAU + Пеноплэкс 50 мм + Пенофол тип С + герметизация Стиз. R=2,1 м²·К/Вт. При −40°C на лоджии +5…+8°C без обогревателя.',
        img: CARD_IMG_C,
        badge: 'Тепло в −40°C',
      },
      {
        title: 'Лоджия 3 м под ключ',
        price: '5 600',
        desc: 'ПВХ + «термос» + ПВХ-панели + ламинат 33 кл. + плинтуса + электрика. Готовая жилая комната за 2–3 дня. Фиксированная смета.',
        img: CARD_IMG_D,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Только остекление',
        title: 'Остекление лоджии 3 м за 1 день',
        desc: 'Замер, изготовление на заводе, монтаж. Две секции по 1 400–1 500 мм — равномерная нагрузка на парапет. ПВХ или алюминий — по несущей способности плиты.',
        features: [
          'Две секции вместо одной — равномерная нагрузка',
          'Трёхслойный шов ПСУЛ + пена + пароизоляция',
          'Монтаж за 4–6 часов, уборка включена',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Остекление + утепление',
        title: 'Остекление и утепление «термос» лоджии 3 м',
        desc: 'ПВХ REHAU + Пеноплэкс 50 мм (стены, потолок, пол) + Пенофол тип С + герметизация швов Стиз-А/Б. Суммарное R=2,1 м²·К/Вт. Срок 2 дня.',
        features: [
          'Пеноплэкс 50 мм — λ=0,032 Вт/м·К',
          'Пенофол тип С — 97% отражение ИК-излучения',
          'Герметизация швов Стиз-А/Б по ГОСТ',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Под ключ (3 дня)',
        title: 'Лоджия 3 м «под ключ» за 3 рабочих дня',
        desc: 'День 1: демонтаж старого + монтаж ПВХ. День 2: утепление «термос» + обрешётка + ПВХ-панели + реечный потолок. День 3: стяжка + ламинат + плинтуса + электрика.',
        features: [
          'Фиксированная смета без доплат',
          'Один прораб ведёт все три дня',
          'Сдача с уборкой и выносом мусора',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'lodzhiya-6-metrov': {
    slug: 'lodzhiya-6-metrov',
    name: 'Лоджия 6 метров в Омске — зонирование и остекление',
    seoDescription:
      'Остекление лоджии 6 метров в Омске: 2–3 секции REHAU с армированием 2,5 мм, зонирование под рабочую зону / хранение / отдых. Усиленный профиль на большом пролёте. Гарантия 5 лет!',
    heroBadge: '📐 6 метров — большой пролёт требует усиленного армирования профиля',
    heroTitle: 'Остекление лоджии 6 метров в Омске',
    heroTitleHighlight: 'длинная лоджия — больше полезной площади',
    heroDesc:
      'Длинную лоджию делим на несколько секций для удобного проветривания и эксплуатации. Подходит для кабинета, кладовой или зоны отдыха. Бесплатный замер, производство на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('lodzhiya-6-metrov', 'interiors'),
    topCard1Title: 'Лоджия 6 м под ключ',
    topCard1Subtitle: '3 секции + усиленное армирование + монтаж',
    topCard1Price: 'от 68 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На все секции, фурнитуру и монтажный шов',
    aboutBadge: 'Большой пролёт — инженерный расчёт обязателен',
    aboutTitle: 'Лоджия 6 метров: пространство для работы, хранения и отдыха',
    aboutImage: DEFAULT_ABOUT_IMG,
    seoText: `Лоджия 6 метров — редкость в панельных домах Омска, но встречается в брежневках серии 1-605 и в ряде домов улучшенной планировки 1980-х. Ключевая инженерная проблема: нельзя ставить одну цельную раму на весь пролёт. Рама 6 000×1 500 мм с двухкамерным стеклопакетом весит 165–210 кг. При тепловом расширении ПВХ-профиль 6 метров изменяет свою длину на 7,2 мм при перепаде 40°C — это сжимает или растягивает монтажный шов, ломает примыкания. Правильное решение: 2–3 независимые секции по 2 000–2 100 мм с температурными деформационными зазорами между ними 6–8 мм.

Армирование профиля — второй критический параметр. Для секций длиной до 1 500 мм достаточно стандартного армирующего вкладыша 1,5 мм. Для 2 000–2 100 мм при высоте профиля 82 мм прогиб от собственного веса стеклопакета составляет 3,8 мм/м — это на 40% превышает допустимые 2,7 мм/м по ГОСТ Р 23166-2021. Применяем усиленное армирование из стали толщиной 2,5 мм (С345), которое снижает прогиб до 1,2 мм/м. Итоговый прогиб самой длинной секции 2 100 мм — 2,5 мм, что укладывается в норму.

Зонирование 6-метровой лоджии — вопрос, который мы прорабатываем ещё на этапе замера. Три зоны по 2 метра: рабочая (стол + полки под окном), хранение (шкаф на торцевой стене от пола до потолка) и зона отдыха (диван или кресла с видом на улицу). Под каждую зону — своя схема отделки и освещения. Рабочая зона: направленный LED 10 Вт + розетка 2P+PE. Зона хранения: встроенный шкаф ЛДСП 18 мм с фасадами МДФ. Зона отдыха: тёплый свет LED 3 000 K, потолочная сушилка Лифт на ролике.

Утепление 6-метровой лоджии — больший объём работ, но технология та же: «термос» Пеноплэкс 50 мм + Пенофол тип С. Особенность: на длинных лоджиях есть риск образования «холодных мостиков» в зонах деформационных швов между секциями. Заделываем эти зоны полосой Пеноплэкса 50×100 мм + пена + Пенофол, закрываем наличником ПВХ. Тепловизионный контроль после монтажа — часть стандартной приёмки объектов такого масштаба.`,
    glazingCard: [
      {
        title: 'Холодное остекление лоджии 6 м',
        price: '3 400',
        desc: 'Алюминий Slidors, 3 секции по 2 000 мм. Усиленные ролики на подшипниках. Масса 28–35 кг. Защита от ветра и осадков без нагрузки на плиту.',
        img: CARD_IMG_B,
        badge: 'Лёгкая конструкция',
      },
      {
        title: 'Тёплое ПВХ лоджии 6 м',
        price: '4 100',
        desc: 'REHAU Grazio 82 мм, 3 секции с армированием 2,5 мм. Деформационные зазоры 6 мм. Прогиб 1,2 мм/м — в норме ГОСТ Р 23166.',
        img: CARD_IMG_A,
        badge: 'Хит продаж',
      },
      {
        title: 'Тёплое ПВХ + утепление 6 м',
        price: '5 200',
        desc: 'ПВХ 3 секции + Пеноплэкс 50 мм на стены/пол/потолок + Пенофол + заделка деформационных швов. R=2,1 м²·К/Вт на всей длине.',
        img: CARD_IMG_C,
        badge: 'Тепло',
      },
      {
        title: 'Лоджия 6 м под ключ с зонированием',
        price: '6 800',
        desc: 'ПВХ + «термос» + отделка + ламинат + шкаф + рабочий стол + освещение по зонам + электрика. Три зоны использования за 4–5 дней.',
        img: CARD_IMG_D,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Три секции по 2 м',
        title: 'Три секции с армированием 2,5 мм',
        desc: 'Делим 6 м на 3 секции по 2 000–2 100 мм. Армирование 2,5 мм (С345) снижает прогиб до 1,2 мм/м. Деформационные зазоры 6 мм — исключают растрескивание швов.',
        features: [
          'Армирование 2,5 мм — норма ГОСТ Р 23166',
          'Деформационный зазор 6 мм между секциями',
          'Фурнитура MACO — 50 000 циклов открывания',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Зонирование 3×2 м',
        title: 'Три функциональные зоны на 6 метрах',
        desc: 'Рабочая зона (LED 10 Вт + розетка), хранение (шкаф ЛДСП 18 мм до потолка) и отдых (тёплый свет 3 000 K + сушилка Лифт). Всё вписывается в 6 м без ущерба для прохода.',
        features: [
          'Шкаф ЛДСП 18 мм + фасады МДФ в зоне хранения',
          'Потолочная сушилка Лифт в зоне отдыха',
          'LED-освещение по зонам: 3 000 K и 4 000 K',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Деформационные швы',
        title: 'Заделка деформационных швов между секциями',
        desc: 'Зоны между секциями: Пеноплэкс 50×100 мм + монтажная пена + Пенофол + наличник ПВХ. Исключают «холодные мостики» и продувание между секциями.',
        features: [
          'Пеноплэкс заполняет зазор между плитами',
          'Пенофол + скотч — герметичный пароизоляционный контур',
          'Наличник ПВХ — скрывает шов и защищает от механики',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'vynosnoj-balkon': {
    slug: 'vynosnoj-balkon',
    name: 'Выносной балкон в Омске — расширение площади на 30–80 см',
    seoDescription:
      'Выносной балкон в Омске: металлокаркас из профтрубы 80×60×3 мм, сварка ГОСТ 14771-76, вынос 30–60 см по полу или 20 см по подоконнику. Согласование с УК. Гарантия 5 лет!',
    heroBadge: '📦 Расширение за фасад — реальное увеличение площади на 0,5–1,5 м²',
    heroTitle: 'Выносной балкон в Омске',
    heroTitleHighlight: 'реальное расширение площади',
    heroDesc:
      'Увеличиваем балкон выносом конструкции за фасад — усиливаем парапет и плиту, помогаем с согласованием проекта. Больше места для отдыха и хранения. Бесплатный выезд на замер, завод на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('vynosnoj-balkon', 'exteriors'),
    topCard1Title: 'Выносной балкон 3 м (вынос 40 см)',
    topCard1Subtitle: 'Металлокаркас + сварка + остекление ПВХ',
    topCard1Price: 'от 85 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На металлокаркас, сварку, покраску и остекление',
    aboutBadge: 'Сварочные работы по ГОСТ 14771-76',
    aboutTitle: 'Выносной балкон: каркас, вынос, остекление — три этапа одной бригадой',
    aboutImage: DEFAULT_ABOUT_IMG,
    seoText: `Выносной балкон — это строительная конструкция, а не просто остекление. Суть: к несущей стене здания привариваем выносной металлокаркас, который расширяет плоскость балкона за фасад на 30–60 см. Основание каркаса — профильные трубы 80×60×3 мм (сталь С245) горизонтально вдоль стены, нижние консоли 80×60×3 мм под углом 90° в сторону улицы с шагом 600–800 мм, поперечные связи 60×40×2 мм. Анкерование горизонтальных труб в несущую стену — химические анкеры Hilti RE 500 V4, ∅16 мм, глубина 150 мм, шаг 400 мм. Расчётная нагрузка на один анкер — 18 кН вырывание / 12 кН срез, фактическая нагрузка от каркаса — 3–4 кН на анкер. Коэффициент запаса — 4,5.

Сварочные работы выполняются по ГОСТ 14771-76 (полуавтоматическая сварка в защитном газе CO₂/Ar). Катет углового шва — 6 мм для основных несущих соединений (консоли к горизонтальным трубам) и 4 мм для поперечных связей. После сварки — обязательный контроль: визуально по ГОСТ 3242-79, измерение твёрдости по Виккерсу (HV не более 350 — критерий отсутствия перегрева и закалки металла). Затем 2 слоя грунта ГФ-021 и 2 слоя эмали ПФ-115. Антикоррозионное покрытие критично для Омска: среднегодовая влажность 72%, промышленные предприятия создают повышенный фон SO₂ в воздухе.

Вынос по полу (30–60 см) и вынос по подоконнику (15–20 см) — два принципиально разных конструктива. Вынос по полу: консоли уходят от уровня балконной плиты, поверх них укладываем профнастил Н-60 или листовую сталь 4 мм с приваркой к консолям, затем стяжка М150 50 мм. Вынос по подоконнику: кронштейны из профтрубы 50×50×3 мм крепятся к боковым стенам и подоконной плите анкерами ∅12 мм, на них устанавливаем рамный профиль остекления — пол не расширяется, расширяется только периметр остекления.

Согласование с управляющей компанией — обязательно для выноса по полу. Мы помогаем оформить техническое заключение, готовим схему нагружения конструкции и передаём пакет документов в УК. В 80% случаев согласование проходит за 1–2 недели. Вынос по подоконнику в Омске не требует согласования: он не изменяет проекцию здания в плане — это позиция большинства управляющих компаний города.`,
    glazingCard: [
      {
        title: 'Металлокаркас выноса по полу (30 см)',
        price: '8 500',
        desc: 'Профтруба 80×60×3 мм, консоли шаг 600 мм, химанкеры Hilti ∅16 мм. Сварка ГОСТ 14771-76. Грунт ГФ-021 + эмаль ПФ-115. Пол на консолях — профнастил + стяжка.',
        img: CARD_IMG_C,
        badge: 'Вынос по полу',
      },
      {
        title: 'Металлокаркас выноса по подоконнику',
        price: '5 500',
        desc: 'Кронштейны 50×50×3 мм на анкерах ∅12 мм. Без изменения пола — расширяется только остекление. Не требует согласования с УК в большинстве случаев.',
        img: CARD_IMG_B,
        badge: 'Без согласования',
      },
      {
        title: 'Каркас + остекление ПВХ REHAU',
        price: '12 000',
        desc: 'Металлокаркас вынос 40 см + ПВХ REHAU 5-камерный с двухкамерным стеклопакетом. Монтаж 2–3 дня. Прибавка площади 1,2 м² для лоджии 3 м.',
        img: CARD_IMG_A,
        badge: 'Хит',
      },
      {
        title: 'Выносной балкон под ключ',
        price: '18 000',
        desc: 'Каркас + остекление + утепление «термос» + отделка + пол. Полноценное расширение лоджии с готовым тёплым интерьером за 4–6 дней.',
        img: CARD_IMG_D,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Вынос по полу (40 см)',
        title: 'Металлокаркас выноса по полу: профтруба 80×60',
        desc: 'Горизонтальные трубы 80×60×3 мм вдоль стены + консоли 80×60×3 мм шаг 600 мм + связи 60×40×2 мм. Химанкеры Hilti ∅16 мм в несущую стену глубиной 150 мм. Нагрузка на анкер 3–4 кН при запасе 18 кН.',
        features: [
          'Сталь С245, сварка ГОСТ 14771-76, катет 6 мм',
          'Химанкеры Hilti ∅16 мм — запас прочности ×4,5',
          'Грунт ГФ-021 + эмаль ПФ-115 — антикоррозия',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Вынос по подоконнику',
        title: 'Кронштейны выноса по подоконнику',
        desc: 'Кронштейны 50×50×3 мм с анкерами ∅12 мм в боковые стены и подоконную плиту. Вынос рамы 15–20 см без изменения пола. Согласование с УК не требуется.',
        features: [
          'Кронштейны 50×50×3 мм — шаг 600 мм',
          'Анкеры ∅12 мм в подоконную плиту',
          'Не меняет проекцию здания — без согласования',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Согласование с УК',
        title: 'Помощь в согласовании выноса по полу',
        desc: 'Готовим техническое заключение, схему нагружения, комплект документов для управляющей компании. 80% согласований в Омске проходят за 1–2 недели.',
        features: [
          'Техническое заключение с расчётом нагрузок',
          'Схема нагружения для УК',
          'Сопровождение до получения разрешения',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'osteklenie-s-vinosom': {
    slug: 'osteklenie-s-vinosom',
    name: 'Остекление балкона с выносом в Омске',
    seoDescription:
      'Остекление балкона с выносом в Омске: вынос по полу (30–40 см) на металлокаркасе или по подоконнику (15–20 см) на кронштейнах. Сварка ГОСТ, морозостойкие герметики. Гарантия 5 лет!',
    heroBadge: '📐 Вынос конструкции — больше пространства без перепланировки',
    heroTitle: 'Остекление балкона с выносом в Омске',
    heroTitleHighlight: 'больше места без сложного согласования',
    heroDesc:
      'Комбинируем остекление с расширением по линии подоконника или пола — полезная площадь растёт, а квартира получает больше света. Бесплатный замер, изготовление на заводе по ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('osteklenie-s-vinosom', 'exteriors'),
    topCard1Title: 'Остекление с выносом по полу 3 м',
    topCard1Subtitle: 'Металлокаркас 30–40 см + ПВХ REHAU + монтаж',
    topCard1Price: 'от 49 200 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На каркас, покраску, профиль и монтажный шов',
    aboutBadge: 'Два вида выноса — два технических решения',
    aboutTitle: 'Остекление с выносом: расширяем пространство без перепланировки',
    aboutImage: CARD_IMG_B,
    seoText: `Остекление с выносом — это не один проект, а два принципиально разных конструктива. Разберём оба. Вынос по полу: металлокаркас из профтрубы 80×60×3 мм анкеруется в несущую стену здания на глубину 120–150 мм. На консолях устраивается новое основание пола (профнастил Н-60 + стяжка М150). ПВХ- или алюминиевая рама устанавливается на расширенный периметр. Реальная прибавка площади — 30–40 см × длину лоджии: для лоджии 3 м вынос 40 см даёт 1,2 м² дополнительной площади. Вынос по подоконнику: кронштейны 50×50×3 мм крепятся к боковым стенам и подоконной плите анкерами ∅12 мм. Рамный профиль смещается наружу на 15–20 см. Пол остаётся на прежнем уровне, расширяется только периметр остекления — создаётся глубокий подоконник 35–50 см.

Ветровые нагрузки на выносную конструкцию выше, чем на стандартный балкон, — из-за увеличенного плеча силы. На Левом берегу Омска (открытая застройка, ветра с Иртыша и степи) при высоте здания 12–20 м нормативное ветровое давление с учётом пульсационной составляющей достигает 0,38 кПа. Сила, действующая на выносную раму 3 м × 1,5 м при этом давлении, — около 1 700 Н. Момент опрокидывания рамы относительно точки крепления консолей при плече 0,4 м — 680 Нм. Анкеры Hilti ∅16 мм с глубиной 150 мм воспринимают этот момент с коэффициентом запаса 3,2.

Герметизация стыка выносной рамы с исходной плоскостью стены — критический узел. Здесь встречаются два разных теплотехнических контура: внутренняя квартирная стена и внешняя выносная рама. Без качественной изоляции в этом месте образуется «тепловой мост» шириной 20–30 мм, через который при −40°C уходит до 25% теплопотерь. Применяем трёхкомпонентную изоляцию этого узла: минеральная вата ISOVER 50 мм в пространстве между стеной и рамой, ПСУЛ по периметру стыка снаружи, пароизоляционная лента изнутри. Температура в стыковой зоне при −40°C — не ниже +3°C.

Морозостойкость сварных швов металлокаркаса — отдельная тема. Углеродистая сталь С245 при −40°C становится более хрупкой: ударная вязкость снижается с 60 до 30 Дж/см². Для Омска это норма — выносные каркасы в нашем городе работают при таких температурах каждую зиму. Поэтому применяем скруглённые переходы от консолей к горизонтальным трубам (радиус ≥10 мм), исключающие концентраторы напряжений, и проверяем швы ультразвуком при объёме сварки более 50 пог. м.`,
    glazingCard: [
      {
        title: 'Вынос по полу 30 см + ПВХ',
        price: '4 100',
        desc: 'Металлокаркас 80×60×3 мм + профнастил + стяжка + ПВХ REHAU 5-кам. Прибавка 0,9 м² для лоджии 3 м. Сварка ГОСТ 14771-76.',
        img: CARD_IMG_C,
        badge: 'Вынос по полу',
      },
      {
        title: 'Вынос по подоконнику 20 см + ПВХ',
        price: '3 800',
        desc: 'Кронштейны 50×50×3 мм + рама смещена на 20 см. Подоконник 40–50 см. Пол не меняется. Монтаж за 1–2 дня.',
        img: CARD_IMG_B,
        badge: 'Вынос по подоконнику',
      },
      {
        title: 'Вынос 40 см + алюминий',
        price: '5 800',
        desc: 'Металлокаркас вынос 40 см + алюминий Slidors. Лёгкая система 8 кг/пм. Для хрущёвок с ограниченной несущей способностью плиты.',
        img: CARD_IMG_A,
        badge: 'Лёгкий вариант',
      },
      {
        title: 'Вынос + утепление + отделка',
        price: '7 200',
        desc: 'Металлокаркас + ПВХ REHAU + «термос» (Пеноплэкс + Пенофол) + ПВХ-панели + ламинат. Готовое расширенное пространство под ключ.',
        img: CARD_IMG_D,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Вынос по полу',
        title: 'Технология выноса по полу: каркас + профнастил',
        desc: 'Консоли 80×60×3 мм анкеруются в несущую стену на 120–150 мм. Профнастил Н-60 сверху + стяжка М150 50 мм. Рама ПВХ устанавливается на расширенный периметр.',
        features: [
          'Анкеры Hilti ∅16 мм — глубина 150 мм, запас ×4',
          'Профнастил Н-60 + стяжка М150 50 мм',
          'Теплоизоляция стыка: ISOVER 50 мм + ПСУЛ',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Вынос по подоконнику',
        title: 'Технология выноса по подоконнику: кронштейны',
        desc: 'Кронштейны 50×50×3 мм с анкерами ∅12 мм в боковые стены. Рама смещается на 15–20 см. Создаётся глубокий подоконник 35–50 см для цветов или хранения.',
        features: [
          'Кронштейны 50×50×3 мм — шаг 600 мм',
          'Глубокий подоконник 35–50 см в результате',
          'Согласование с УК не требуется',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Узел стыка со стеной',
        title: 'Изоляция стыка выносной рамы со стеной',
        desc: 'ISOVER 50 мм в пространстве стык + ПСУЛ снаружи + пароизоляционная лента изнутри. Тепловой мост в стыке устранён: температура при −40°C не ниже +3°C.',
        features: [
          'ISOVER 50 мм — заполнение пространства стыка',
          'ПСУЛ снаружи — компенсация деформаций',
          'Пароизоляционная лента изнутри — конденсата нет',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'vynos-po-podokonniku': {
    slug: 'vynos-po-podokonniku',
    name: 'Вынос остекления по подоконнику в Омске',
    seoDescription:
      'Вынос остекления по подоконнику в Омске: кронштейны из профтрубы 50×50×3 мм, анкерование Hilti ∅12 мм в плиту, рама смещается на 15–20 см. Без изменения пола. Гарантия 5 лет!',
    heroBadge: '🪟 Вынос по подоконнику — больше места без изменения пола',
    heroTitle: 'Вынос остекления по подоконнику в Омске',
    heroTitleHighlight: 'широкий подоконник без нагрузки на плиту',
    heroDesc:
      'Расширяем подоконную доску наружу — появляется место для цветов, декора и мелочей, при этом нагрузка на плиту почти не меняется. Бесплатный выезд замерщика, завод по ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('vynos-po-podokonniku', 'exteriors'),
    topCard1Title: 'Вынос по подоконнику лоджии 3 м',
    topCard1Subtitle: 'Кронштейны 50×50×3 мм + ПВХ REHAU + монтаж',
    topCard1Price: 'от 45 600 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На кронштейны, сварку, профиль и монтажный шов',
    aboutBadge: 'Без изменения пола — без согласования',
    aboutTitle: 'Вынос по подоконнику: расширяем остекление без бюрократии',
    aboutImage: CARD_IMG_B,
    seoText: `Вынос по подоконнику — технически самый простой из видов расширения балкона. Конструктив: к боковым стенам балкона крепятся горизонтальные кронштейны из профтрубы 50×50×3 мм длиной 15–20 см. На них устанавливается рамный стартовый профиль, к которому крепится рама остекления. Пол и парапет остаются на исходных позициях — меняется только положение наружной рамы. Визуально: рама «выходит» наружу относительно фасада на 15–20 см, создавая внутри глубокий подоконник 35–55 см (в зависимости от толщины исходного парапета и глубины выноса).

Кронштейны из профтрубы 50×50×3 мм испытывают преимущественно изгибающий момент от веса рамы и ветровое давление. Для рамы ПВХ REHAU 82 мм с двухкамерным стеклопакетом весом 20–25 кг/пм на кронштейн длиной 200 мм нагрузка от изгиба составляет 5 кН·мм. Момент сопротивления профиля 50×50×3 мм — Wx = 4,3 см³, расчётное сопротивление стали С245 — Ry = 240 МПа. Расчётный изгибающий момент в опасном сечении — 1,2 кН·мм. Запас прочности — 3,6. Шаг кронштейнов — 600–800 мм по всей длине лоджии; для лоджии 3 м это 4–5 кронштейнов.

Анкерование кронштейнов — ключевой момент. Кронштейн крепится к боковой стене балкона анкерами ∅12 мм в бетон или кирпич. Для бетонных боковин: распорные анкеры Fischer FBN II ∅12 мм, глубина заделки 80 мм, усилие вырывания 11,2 кН — запас ×3,7 от расчётной нагрузки. Для кирпичных боковин: химические анкеры Hilti HIT-RE 500 V4 ∅12 мм, глубина 70 мм в кирпич (не в швы!), усилие вырывания 7,8 кН — запас ×2,6. В обоих случаях — достаточный запас прочности. Для дополнительной надёжности рекомендуем крепить нижний опорный кронштейн к подоконной плите вертикальными анкерами М10 — это исключает поворот кронштейновой системы вниз под ветровой нагрузкой.

Антикоррозионная защита кронштейнов для омского климата — обязательна. Средняя влажность воздуха в Омске — 72%, сезон конденсации — октябрь–апрель (7 месяцев). Без покрытия стальные кронштейны ржавеют насквозь за 8–10 лет. Применяем двухслойную систему: грунт ГФ-021 (красно-коричневый, 80 мкм) + эмаль ПФ-115 (2 слоя, 60 мкм каждый). Общая толщина покрытия 200 мкм обеспечивает защиту от коррозии не менее 25 лет при периодическом осмотре. Монтажные швы от сверления: незаполненные отверстия бетон/кирпич дополнительно защищаем силиконовым герметиком Soudal Silirub-N — исключаем попадание воды в шов анкера и его коррозию изнутри.`,
    glazingCard: [
      {
        title: 'Кронштейны + ПВХ REHAU (вынос 15 см)',
        price: '3 800',
        desc: 'Кронштейны 50×50×3 мм, шаг 700 мм, анкеры Fischer ∅12 мм + ПВХ REHAU 5-кам. Подоконник 35 см. Монтаж за 1 день.',
        img: CARD_IMG_B,
        badge: 'Хит продаж',
      },
      {
        title: 'Кронштейны + ПВХ REHAU (вынос 20 см)',
        price: '4 200',
        desc: 'Вынос 20 см — подоконник 45–50 см. Кронштейны 50×50×3 мм + нижний опорный анкер в плиту М10. ПВХ REHAU 82 мм.',
        img: CARD_IMG_A,
        badge: 'Глубокий подоконник',
      },
      {
        title: 'Кронштейны + алюминий Slidors',
        price: '3 600',
        desc: 'Вынос 15–20 см + алюминий Slidors. Лёгкая конструкция для хрущёвок. Масса рамы 6–8 кг/пм. Кронштейны 40×40×2 мм.',
        img: CARD_IMG_B,
        badge: 'Для хрущёвок',
      },
      {
        title: 'Вынос по подоконнику под ключ',
        price: '5 200',
        desc: 'Кронштейны + ПВХ 5-кам. + утепление Пеноплэкс 50 мм + ПВХ-панели + ламинат. Готовый интерьер с расширенным подоконником.',
        img: CARD_IMG_D,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Расчёт кронштейнов',
        title: 'Расчёт кронштейнов 50×50×3 мм',
        desc: 'Изгибающий момент при вылете 200 мм и нагрузке 25 кг — 1,2 кН·мм. Момент сопротивления 50×50×3 мм — Wx=4,3 см³. Запас прочности — 3,6. Шаг кронштейнов 600–800 мм.',
        features: [
          'Запас прочности 3,6 при вылете 200 мм',
          'Шаг 600–800 мм — 4–5 кронштейнов на лоджию 3 м',
          'Нижний анкер в плиту М10 — от поворота',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Анкерование в стену',
        title: 'Анкеры Fischer FBN II и Hilti HIT-RE 500 V4',
        desc: 'Бетонные боковины: Fischer FBN II ∅12 мм, глубина 80 мм, усилие вырывания 11,2 кН. Кирпичные: Hilti HIT-RE ∅12 мм, глубина 70 мм, усилие 7,8 кН. Запас ×2,6–3,7.',
        features: [
          'Fischer FBN II ∅12 мм для бетона — 11,2 кН',
          'Hilti HIT-RE 500 для кирпича — 7,8 кН',
          'Минимальный запас по вырыванию — ×2,6',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Антикоррозионное покрытие',
        title: 'Защита кронштейнов от коррозии в Омске',
        desc: 'Грунт ГФ-021 (80 мкм) + эмаль ПФ-115 ×2 слоя (120 мкм) = 200 мкм суммарно. Ресурс 25 лет при среднегодовой влажности 72% в Омске. Швы анкеров — Soudal Silirub-N.',
        features: [
          'Суммарное покрытие 200 мкм — 25 лет защиты',
          'Швы анкеров — силикон Soudal от попадания воды',
          'Периодический осмотр 1 раз в 5 лет',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  // ── БАТЧ №3: ФРАНЦУЗСКОЕ ОСТЕКЛЕНИЕ, РАЗДВИЖНЫЕ, БЕЗРАМНОЕ, УТЕПЛЕНИЕ, ОТДЕЛКА ─

  'francuzskie-okna': {
    slug: 'francuzskie-okna',
    name: 'Французские окна на балконе в Омске',
    seoDescription:
      'Французские окна на балконе в Омске — ПВХ или алюминиевая рама высотой 2 200–2 800 мм, закалённое стекло 8 мм в нижней части, усиление парапета металлокаркасом 60×60×3 мм. Монтаж за 1–2 дня, гарантия 5 лет!',
    heroBadge: '🪟 Французское окно — рама в полный рост без подоконника, свет ×2',
    heroTitle: 'Французские окна на балконе в Омске',
    heroTitleHighlight: 'окна от пола до потолка',
    heroDesc:
      'Полноразмерные окна без подоконника наполняют комнату светом и выглядят эффектно с улицы. Перед монтажом усиливаем парапет для безопасности. Бесплатный замер, производство на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('francuzskie-okna', 'interiors'),
    topCard1Title: 'Французские окна на лоджии 3 м',
    topCard1Subtitle: 'Закалённое стекло 8 мм + усиление парапета + монтаж',
    topCard1Price: 'от 54 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На стекло, усиление парапета и монтажный шов',
    aboutBadge: 'Максимум света при омских зимах',
    aboutTitle: 'Французские окна: архитектурный акцент и 2,3× больше света',
    aboutImage: CARD_IMG_D,
    seoText: `Французское окно — технически это остекление высотой от 2 000 до 2 800 мм, не имеющее горизонтального подоконника в нижней части. Конструктив: в нижней зоне (до 90 см от уровня пола) стоит закалённое монолитное стекло 8 мм или Triplex 6.4.6 мм, выше — стандартный открывающийся или глухой стеклопакет. Смысл: площадь остекления возрастает с 45–55% фасада (стандартное остекление) до 82–90%, световой поток — в 2,3 раза. Для Омска с декабрьским световым днём 7–8 часов это прямая прибавка качества жизни.

Закалённое стекло 8 мм — не прихоть, а требование безопасности. По ГОСТ 30826-2014 в зонах остекления ниже 80 см (т. н. «зона риска падения») обязательно применение безопасного стекла: закалённого или ламинированного. Закалённое монолитное 8 мм при ударе разрушается на мелкие тупые осколки без острых кромок. Прочность на изгиб — 120 МПа (против 40 МПа у обычного), сопротивление ветровой нагрузке на пролёте 1 200 мм — 1 800 Па, что перекрывает омское нормативное давление ветра (230 Па) с запасом 7,8. Triplex 6.4.6 при разрушении держит осколки на ПВБ-плёнке — ещё безопаснее, но дороже примерно на 35%.

Усиление парапета перед монтажом французского окна — инженерное требование, а не коммерческая опция. Стандартный балконный парапет (бетон или кирпич толщиной 100–150 мм) рассчитан на удержание человека от падения: горизонтальная нагрузка 300 Н/м по СП 20.13330. Рама высотой 2 600 мм при ветре 12 м/с передаёт на парапет момент опрокидывания 780 Нм/м. Без металлокаркаса парапет не выдерживает этот момент — трещины и смещение рамы появляются через 2–3 зимы. Мы устанавливаем металлокаркас из квадратной трубы 60×60×3 мм, анкерованной в плиту на глубину 150 мм, с шагом 400 мм — расчётная несущая способность конструкции 2 400 Нм/м, запас ×3,1.

Температурные деформации рамы высотой 2 600 мм при суточном перепаде 40°C (типично для омской весны): ΔL = α·L·ΔT = 0,00007·2 600·40 = 7,3 мм для ПВХ-профиля. Без компенсационного зазора в верхнем примыкании рама защемляет потолочный профиль и деформируется. Мы оставляем компенсационный зазор 10–12 мм в верхнем и боковых примыканиях, заполняем его ПСУЛ, и рама свободно «дышит» на протяжении всего срока службы.`,
    glazingCard: [
      {
        title: 'Французское окно ПВХ — тёплое',
        price: '3 600',
        desc: 'ПВХ REHAU 5-кам. высота 2 200–2 800 мм + закалённое стекло 8 мм в нижней зоне. Стеклопакет i-стекло + аргон. Металлокаркас парапета включён.',
        img: CARD_IMG_D,
        badge: 'Тёплый витраж',
      },
      {
        title: 'Французское окно алюминий — холодное',
        price: '4 200',
        desc: 'Алюминиевый профиль с минимальной видимой шириной 45 мм + закалённое стекло 8 мм. Лёгкость конструкции, панорамный эффект. Усиление парапета.',
        img: CARD_IMG_B,
        badge: 'Минимум рам',
      },
      {
        title: 'Triplex 6.4.6 мм — нижняя зона',
        price: '5 200',
        desc: 'Вместо закалённого монолита — Triplex: разрушенное стекло держится на ПВБ-плёнке. Максимальная безопасность. Подходит для квартир с детьми.',
        img: CARD_IMG_D,
        badge: 'Самое безопасное',
      },
      {
        title: 'Французские окна под ключ',
        price: '6 500',
        desc: 'Металлокаркас + французское ПВХ-остекление + откосы + подоконник (МДФ или ПВХ) + монтаж. Готовый световой интерьер за 2 дня.',
        img: CARD_IMG_A,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Нижняя зона — закалённое стекло',
        title: 'Закалённое стекло 8 мм: прочность и безопасность',
        desc: 'Зона до 90 см: закалённое монолитное стекло 8 мм. Прочность на изгиб 120 МПа, ветровое давление выдерживает 1 800 Па при норме для Омска 230 Па. По ГОСТ 30826-2014.',
        features: [
          'Прочность 120 МПа — в 3 раза выше обычного стекла',
          'При разрушении — мелкие тупые осколки, не острые',
          'Альтернатива — Triplex 6.4.6 мм для максимальной защиты',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Усиление парапета',
        title: 'Металлокаркас 60×60×3 мм под высокую раму',
        desc: 'Квадратная труба 60×60×3 мм на анкерах глубиной 150 мм с шагом 400 мм. Расчётный момент 2 400 Нм/м — запас ×3,1 к требованиям ветровой нагрузки высокой рамы.',
        features: [
          'Анкеры ∅10 мм, глубина 150 мм, шаг 400 мм',
          'Несущая способность каркаса 2 400 Нм/м',
          'Обязательно перед монтажом рамы >1 500 мм высотой',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Температурный зазор',
        title: 'Компенсационный зазор 10 мм в верхнем примыкании',
        desc: 'При суточном перепаде 40°C ПВХ-рама высотой 2 600 мм деформируется на 7,3 мм. Зазор 10–12 мм в верхней и боковых примыканиях + ПСУЛ — рама дышит без деформации.',
        features: [
          'Зазор 10–12 мм в верхнем примыкании обязателен',
          'ПСУЛ 30×10 мм компенсирует тепловое расширение',
          'Без зазора — перекос рамы через 2–3 омские зимы',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'francuzskoe-osteklenie': {
    slug: 'francuzskoe-osteklenie',
    name: 'Французское остекление балконов в Омске — витражные системы',
    seoDescription:
      'Французское остекление балконов в Омске под ключ: профильные витражные системы REHAU/VEKA/алюминий, закалённое стекло 8 мм, металлокаркас парапета, монтаж по ГОСТ 30971. Цены от 3 600 ₽/м². Гарантия 5 лет!',
    heroBadge: '🏙️ Французское остекление — витражная система для любого типа балкона',
    heroTitle: 'Французское остекление балконов в Омске',
    heroTitleHighlight: 'стиль и максимум дневного света',
    heroDesc:
      'Стеклянная стена от пола до потолка превращает балкон в светлую зону отдыха с современным видом. Проводим осмотр плиты и парапета перед установкой. Бесплатный замер, завод на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('francuzskoe-osteklenie', 'interiors'),
    topCard1Title: 'Французское остекление лоджии 3 м',
    topCard1Subtitle: 'Витраж от пола до потолка + металлокаркас + монтаж',
    topCard1Price: 'от 54 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На профиль, стекло, металлокаркас и монтажный шов',
    aboutBadge: 'Витражные системы от завода',
    aboutTitle: 'Французское остекление: от обследования до готового витража',
    aboutImage: CARD_IMG_D,
    seoText: `Французское остекление как система — это сочетание нескольких конструктивных решений, каждое из которых влияет на итоговый результат. Первое — профильная система. Для тёплого варианта: REHAU Grazio 82 мм или VEKA Softline 82 мм с пятикамерным профилем, Rf=1,06 м²·К/Вт. Высота профиля подбирается по фактическому расстоянию от пола до потолка балкона с компенсационным зазором 10 мм сверху. Для холодного варианта: алюминиевый профиль 45–50 мм с терморазрывом или без него — зависит от цели использования. Без терморазрыва при −40°C внешний алюминий промерзает насквозь и становится источником конденсата. Для Омска рекомендуем тёплый ПВХ в 95% случаев.

Второй элемент системы — нижний стартовый профиль. Он заменяет подоконник и принимает нагрузку от веса рамы. Стартовый профиль из оцинкованной стали 2 мм крепится к верхней плоскости парапета дюбелями ∅8 мм с шагом 400 мм. Под стартовый профиль укладывается демпфирующая прокладка из EPDM-резины 5 мм, компенсирующая неровности парапета (допустимое отклонение горизонтали ±3 мм на 3 000 мм). Без демпфирующей прокладки в зонах неровностей профиль работает в изгибе и со временем трескается.

Третий элемент — монтажный шов по ГОСТ 30971-2012. Снаружи: ПСУЛ (предварительно сжатая уплотнительная лента) с паропроницаемостью не менее 0,5 м²·ч·Па/мг — обязательное условие, иначе конденсат накапливается внутри шва. Средний слой: монтажная пена Soudal Gun'N'Foam с λ = 0,040 Вт/м·К — наносится без давления, с заполнением шва на 60–70% объёма (пена расширяется). Изнутри: пароизоляционная лента ИЛЬБРУК 600, Sd ≥ 13 м. Нарушение этой триады в омских условиях создаёт конденсат в шве и его деградацию за 3–5 лет вместо нормативных 20+.

Четвёртый, часто упускаемый элемент — откосы. Внутренние откосы при французском остеклении — не декор, а теплоизоляционная функция. Откос шириной 50–80 мм соединяет тёплую внутреннюю плоскость рамы с холодной стеной. Без утеплённого откоса (сэндвич-панель 24 мм или ПВХ с Пеноплэксом 20 мм за ним) этот узел становится мостиком холода. Наша стандартная комплектация: ПВХ-откос 0,8 мм поверх Пеноплэкса 20 мм на металлических кронштейнах — мостик холода ликвидирован.`,
    glazingCard: [
      {
        title: 'Французское остекление ПВХ (тёплое)',
        price: '3 600',
        desc: 'REHAU Grazio 82 мм, высота до 2 800 мм. Нижняя зона — закалённое стекло 8 мм. Демпфирующая прокладка EPDM 5 мм под стартовый профиль.',
        img: CARD_IMG_D,
        badge: 'Рекомендуем',
      },
      {
        title: 'Французское остекление алюминий',
        price: '4 500',
        desc: 'Алюминий с терморазрывом 28 мм + закалённое стекло 8 мм. Для балконов, где важна минимальная ширина рамы (35–40 мм) и современный вид.',
        img: CARD_IMG_B,
        badge: 'Современный вид',
      },
      {
        title: 'Французское + тёплые откосы',
        price: '5 400',
        desc: 'Французская система + ПВХ-откосы с Пеноплэксом 20 мм. Устранён мостик холода в зоне откоса. Температура в углу стена/рама ≥+8°C при −40°C снаружи.',
        img: CARD_IMG_A,
        badge: 'Без мостиков холода',
      },
      {
        title: 'Французское под ключ',
        price: '7 200',
        desc: 'Металлокаркас + витраж + откосы + утепление «термос» + ПВХ-отделка. Готовое светлое тёплое пространство за 2–3 дня. Фиксированная смета.',
        img: CARD_IMG_C,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Стартовый профиль',
        title: 'Стартовый профиль — основание французской системы',
        desc: 'Оцинкованная сталь 2 мм + EPDM-прокладка 5 мм. Допуск горизонтали ±3 мм/3 000 мм. Дюбели ∅8 мм шаг 400 мм. Без этого профиля рама висит на монтажной пене — ненадёжно.',
        features: [
          'EPDM 5 мм компенсирует неровности парапета',
          'Дюбели ∅8 мм шаг 400 мм — равномерная нагрузка',
          'Допустимое отклонение горизонтали ±3 мм',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Шов по ГОСТ 30971',
        title: 'Монтажный шов: ПСУЛ + пена + пароизоляция',
        desc: 'ПСУЛ снаружи (паропроницаемость ≥0,5 м²·ч·Па/мг), пена Soudal 60–70% заполнения, лента ИЛЬБРУК 600 изнутри (Sd ≥13 м). Ресурс шва — 20+ лет.',
        features: [
          'ПСУЛ паропроницаемость ≥0,5 — влага выходит наружу',
          'Пена заполнение 60–70% — не трескается при расширении',
          'Пароизоляция Sd≥13 м — конденсат не образуется',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Тёплые откосы',
        title: 'Утеплённые откосы — без мостиков холода',
        desc: 'ПВХ-откос 0,8 мм поверх Пеноплэкса 20 мм. При −40°C снаружи температура в углу стена/рама — не ниже +8°C. Конденсат и плесень в этой зоне исключены.',
        features: [
          'Пеноплэкс 20 мм за откосом — ликвидация мостика холода',
          'ПВХ 0,8 мм — влагостоек, моется, не желтеет',
          'Температура в углу ≥+8°C при −40°C снаружи',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'razdvizhnye-sistemy': {
    slug: 'razdvizhnye-sistemy',
    name: 'Раздвижные системы остекления балконов в Омске',
    seoDescription:
      'Раздвижные системы остекления балконов в Омске — Slidors и Provedal: нижний рельс из профиля 8×20 мм, ролики на подшипниках 50 000 циклов, уплотнитель EPDM. От 2 700 ₽/м². Гарантия 5 лет!',
    heroBadge: '↔️ Раздвижные системы — створки не мешают мебели и сушилке',
    heroTitle: 'Раздвижное остекление балконов в Омске',
    heroTitleHighlight: 'створки не мешают на балконе',
    heroDesc:
      'Раздвижные створки ездят по направляющим — остаётся место для мебели, сушилки и цветов. Лёгкая конструкция подходит для старых домов. Бесплатный выезд на замер, завод по ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('razdvizhnye-sistemy', 'interiors'),
    topCard1Title: 'Раздвижное остекление лоджии 3 м',
    topCard1Subtitle: 'Slidors — 2 раздвижные секции + монтаж',
    topCard1Price: 'от 32 400 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На профиль, ролики, рельс и монтаж',
    aboutBadge: 'Раздвижная система — практично и удобно',
    aboutTitle: 'Раздвижные системы: як ролики работают 50 000 циклов без замены',
    aboutImage: CARD_IMG_B,
    seoText: `Раздвижная система для балкона — это не просто «створки на рельсах». За видимой простотой стоит точно рассчитанный механизм. Нижний направляющий рельс из алюминиевого профиля 8×20 мм воспринимает вес створки и направляет её движение. Верхний направляющий — алюминиевый профиль 8×10 мм — обеспечивает горизонтальную устойчивость и предотвращает выпадение створки при сильном ветре. Ролики из нейлона 66 с встроенным подшипником 606ZZ выдерживают нагрузку 40 кг на ролик и 50 000 циклов открывания без деградации хода. Для лоджии 3 м с 4 роликами (2 на каждую из 2 створок) суммарная нагрузкоспособность — 160 кг, тогда как реальная нагрузка от двух створок — 24–36 кг. Коэффициент запаса 4,4.

Уплотнитель в раздвижной системе работает иначе, чем в распашной. Закрытые скользящие уплотнители (pile — ворсовые) обеспечивают герметизацию по вертикали между пересекающимися створками. EPDM-профиль с ячеистой структурой закрывает горизонтальный шов по верхней и нижней направляющим. Итоговая герметичность раздвижной системы: ветрозащита при скорости ветра до 28 м/с — это соответствует шторму 8 баллов по шкале Бофора. Важно понимать: раздвижная система — холодное остекление. Между двумя слоями стекла нет герметичного газового промежутка, как в стеклопакете. Это значит — защита от ветра, пыли и дождя, но не тепловой барьер. Если цель — тёплое помещение, нужна ПВХ-рама с двухкамерным стеклопакетом.

Регулировка роликов — обязательный этап финальной настройки. После монтажа все ролики регулируются по высоте с точностью 3 мм через нижнюю заглушку профиля. Цель: горизонтальность движения каждой створки с допуском ±2 мм/1 000 мм и зазор 4–5 мм между нижним краем створки и рельсом. Неотрегулированные ролики создают перекос стекла, что увеличивает сопротивление хода и ускоряет износ уплотнителей. Мы проверяем ход каждой створки динамометром: усилие открывания не должно превышать 25 Н (2,5 кг) — это стандарт, при котором системой удобно пользоваться одной рукой.

Особенность омского климата для раздвижных систем: при −30°C стекло и алюминий сжимаются. Линейное сжатие алюминиевого профиля 3 000 мм при ΔT=60°C (от +20°C до −40°C) — 4,2 мм. Без компенсационных зазоров на торцах профиль упирается в боковые заглушки и деформирует рельс. Мы устанавливаем торцевые заглушки с зазором 5 мм с каждой стороны — этого достаточно для полного цикла температурных деформаций в Омске.`,
    glazingCard: [
      {
        title: 'Slidors — 2 раздвижные секции',
        price: '2 700',
        desc: 'Алюминий Slidors, нижний рельс 8×20 мм, ролики с подшипником 606ZZ. 50 000 циклов гарантированного хода. EPDM уплотнитель. Монтаж за 3–4 часа.',
        img: CARD_IMG_B,
        badge: 'Хит продаж',
      },
      {
        title: 'Slidors — 3 раздвижные секции (лоджия 6 м)',
        price: '3 000',
        desc: '3 секции по 2 000 мм на одном рельсе. Каждая секция паркуется за соседней. Полное открытие 100%. Для длинных лоджий.',
        img: CARD_IMG_A,
        badge: 'Для 6 метров',
      },
      {
        title: 'Provedal — распашная раздвижная',
        price: '2 900',
        desc: 'Распашные петлевые створки на алюминиевом профиле Provedal. Ход на петлях, не рельсах. Герметичнее Slidors, меньше щелей при сильном ветре.',
        img: CARD_IMG_B,
        badge: 'Плотнее прилегание',
      },
      {
        title: 'Раздвижная + козырёк (последний этаж)',
        price: '3 800',
        desc: 'Slidors + металлокаркасный козырёк с поликарбонатом 8 мм. Полная защита от снега и дождя. Масса всей конструкции — 35–45 кг.',
        img: CARD_IMG_C,
        badge: 'Для последнего этажа',
      },
    ],
    StructureTab: [
      {
        tabName: 'Механизм роликов',
        title: 'Ролики 606ZZ — 50 000 циклов без замены',
        desc: 'Нейлон 66 с подшипником 606ZZ, нагрузка 40 кг/ролик, запас ×4,4 от реальной нагрузки. Регулировка по высоте ±3 мм. Усилие хода ≤25 Н (2,5 кг) — одной рукой.',
        features: [
          'Подшипник 606ZZ — 50 000 циклов без износа',
          'Регулировка ±3 мм через нижнюю заглушку',
          'Усилие хода ≤25 Н — ГОСТ-критерий удобства',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Герметизация',
        title: 'Pile-уплотнитель и EPDM: защита до 28 м/с',
        desc: 'Вертикальные стыки между створками — ворсовый pile. Горизонтальные примыкания к направляющим — EPDM ячеистый. Ветрозащита до 28 м/с (8 баллов по Бофору).',
        features: [
          'Pile-уплотнитель по вертикали между створками',
          'EPDM по горизонтали к нижней и верхней направляющим',
          'Ветрозащита 28 м/с — достаточно для омских ветров',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Температурный зазор',
        title: 'Компенсационные зазоры 5 мм на торцах рельса',
        desc: 'Алюминий 3 000 мм при ΔT=60°C сжимается на 4,2 мм. Зазор 5 мм на каждом торце рельса исключает деформацию рельса и клиновой зажим роликов зимой.',
        features: [
          'Линейное сжатие Al 3 000 мм при −40°C — 4,2 мм',
          'Зазор 5 мм с каждой стороны — полная компенсация',
          'Проверка хода при −20°C в мастерской перед монтажом',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'bezramnoe-osteklenie': {
    slug: 'bezramnoe-osteklenie',
    name: 'Безрамное остекление балконов в Омске — система Lumon и аналоги',
    seoDescription:
      'Безрамное остекление балконов в Омске: закалённое стекло 8–10 мм в алюминиевых направляющих без видимых рам. Максимальный обзор, складывание в пакет. Требования к парапету — высота ≥850 мм. Гарантия 5 лет!',
    heroBadge: '🔲 Безрамное остекление — стеклянная стена без профилей',
    heroTitle: 'Безрамное остекление балконов в Омске',
    heroTitleHighlight: 'панорамный вид без массивных рам',
    heroDesc:
      'Стеклянные панели без громоздких профилей — максимум обзора и современный внешний вид. Подходит для новостроек и домов с надёжным парапетом. Бесплатный замер, производство на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('bezramnoe-osteklenie', 'interiors'),
    topCard1Title: 'Безрамное остекление лоджии 3 м',
    topCard1Subtitle: 'Закалённое стекло 8 мм + направляющие + монтаж',
    topCard1Price: 'от 63 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На стекло, направляющие и крепления',
    aboutBadge: 'Премиум-формат для новостроек',
    aboutTitle: 'Безрамное остекление: максимум обзора при жёстких требованиях к основанию',
    aboutImage: CARD_IMG_D,
    seoText: `Безрамное остекление — самый эстетически чистый вариант: никаких видимых вертикальных профилей, только стекло. Принцип системы Lumon и её аналогов: закалённые стеклянные панели 8–10 мм вставляются в верхнюю и нижнюю направляющие из анодированного алюминия. Каждая панель вращается на вертикальной оси на 90–270° и может складываться с соседними. В полностью открытом положении все панели паркуются пакетом у одной из боковых стен — балкон открывается на 100%. Панель шириной 600–700 мм и высотой 2 400 мм из закалённого стекла 8 мм весит 29–34 кг. Крепление только через верхнюю и нижнюю направляющие — никаких точечных зажимов, никакой сварки.

Стекло в безрамной системе — единственный конструктивный элемент, несущий нагрузку в плоскости панели. Минимальная толщина — 8 мм, рекомендуемая для пролётов свыше 2 200 мм — 10 мм. Закалённое стекло (термообработка 620–650°C с последующей закалкой воздухом) имеет прочность на изгиб 120 МПа, прочность на сжатие 1 000 МПа. Стойкость к ветровой нагрузке панели 600×2 400 мм из стекла 8 мм: 1 800 Па при схеме опирания «нижняя + верхняя направляющая» с расстоянием между опорами 2 400 мм. Для сравнения: нормативное ветровое давление в Омске (I ветровой район, высота 10–20 м) — 320–410 Па. Запас — 4,4–5,6. При ударе кулаком (300 Н) стекло 8 мм не разрушается; при разрушении (например, от вандализма) — рассыпается на гранулы без острых кромок по ГОСТ 30826.

Требования к парапету для безрамной системы строже, чем для рамного остекления. Во-первых, высота не менее 850 мм (по нормам безопасности для холодных ограждений). Во-вторых, горизонтальность верхней плоскости парапета ±3 мм/3 000 мм — иначе нижняя направляющая устанавливается с наклоном, и панели самопроизвольно съезжают в одну сторону. В-третьих, несущая способность парапета в горизонтальном направлении не менее 300 Н/м — для крепления нижней направляющей. Для большинства хрущёвок Омска это пограничная ситуация: рекомендуем безрамное остекление после обследования и при необходимости — укрепления парапета.

Безрамная система — исключительно холодный вариант: стыки между панелями не герметичны (зазор 3–5 мм), конвекция воздуха через эти зазоры неизбежна. При температуре −30°C разница температур между застеклённым и незастеклённым балконом — около 5–8°C (ветрозащита сокращает конвекционный теплообмен). Для обогрева балкона с безрамным остеклением потребуется утеплённое напольное покрытие и электрический обогреватель, но полноценной «тёплой комнаты» не получится. Это честно, и мы всегда говорим об этом на замере — чтобы клиент принял решение с пониманием ограничений.`,
    glazingCard: [
      {
        title: 'Безрамное остекление — стекло 8 мм',
        price: '4 200',
        desc: 'Закалённое стекло 8 мм в анодированных направляющих. Прочность на изгиб 120 МПа, ветровая нагрузка 1 800 Па. Складывается в пакет 100%.',
        img: CARD_IMG_D,
        badge: 'Классический выбор',
      },
      {
        title: 'Безрамное остекление — стекло 10 мм',
        price: '5 100',
        desc: 'Закалённое стекло 10 мм для пролётов >2 200 мм. Жёсткость и ветростойкость выше на 50%. Рекомендуется для домов выше 5 этажей.',
        img: CARD_IMG_D,
        badge: 'Для высоких этажей',
      },
      {
        title: 'Безрамное Triplex 8.4.8 мм',
        price: '6 800',
        desc: 'Triplex: два листа 8 мм на ПВБ-плёнке. При разрушении — осколки держатся на плёнке. Максимальная безопасность для семей с детьми.',
        img: CARD_IMG_D,
        badge: 'Безопаснее',
      },
      {
        title: 'Безрамное + усиление парапета',
        price: '7 500',
        desc: 'Металлокаркас парапета + безрамная система 8 мм. Для парапетов с несущей способностью <300 Н/м — обязательный первый этап.',
        img: CARD_IMG_C,
        badge: 'С усилением',
      },
    ],
    StructureTab: [
      {
        tabName: 'Механизм панелей',
        title: 'Панели на вращающейся оси — открытие 100%',
        desc: 'Каждая панель вращается на 90–270° вокруг вертикальной оси. В открытом положении складываются пакетом у боковой стены. Площадь открытия 100% — балкон как открытая терраса.',
        features: [
          'Угол поворота панели 90–270°',
          'Пакетирование у боковой стены — 100% открытие',
          'Удержание в любом положении — зажимное устройство',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Требования к парапету',
        title: 'Три требования к парапету для безрамной системы',
        desc: 'Высота ≥850 мм. Горизонталь ±3 мм/3 000 мм. Несущая способность ≥300 Н/м. Для хрущёвок часто требуется обследование. Самосдвижение панелей при наклоне — устраняется клиньями под нижнюю направляющую.',
        features: [
          'Высота парапета ≥850 мм — требование безопасности',
          'Горизонталь ±3 мм — иначе панели съезжают',
          'Несущая способность 300 Н/м — проверяем при замере',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Холодное остекление',
        title: 'Ограничения: безрамное — только холодный формат',
        desc: 'Зазор 3–5 мм между панелями не герметичен. При −30°C на безрамном балконе на 5–8°C теплее, чем снаружи. Для полноценного тепла нужен ПВХ стеклопакет. Честно предупреждаем на замере.',
        features: [
          'Разница с улицей +5–8°C при закрытых панелях',
          'Не является заменой тёплого остекления с ПВХ',
          'Идеально для летних террас и новостроек ЖК',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'uteplenie-penopleksom': {
    slug: 'uteplenie-penopleksom',
    name: 'Утепление балкона Пеноплэксом в Омске',
    seoDescription:
      'Утепление балкона Пеноплэксом в Омске: ЭППС 35 кг/м³, λ=0,032 Вт/м·К, водопоглощение 0,4%. Клей CERESIT CT85 + грибки 10×120 мм (5 шт/м²), запенка швов. От 1 100 ₽/м². Гарантия 5 лет!',
    heroBadge: '💧 Пеноплэкс — λ=0,032 Вт/м·К, водопоглощение 0,4%, не гниёт',
    heroTitle: 'Утепление балкона в Омске',
    heroTitleHighlight: 'влагостойкая теплоизоляция',
    heroDesc:
      'Укладываем экструдированный утеплитель на пол, стены и потолок лоджии — материал не впитывает влагу и не гниёт. После утепления лоджия заметно теплее зимой. Бесплатный замер, завод на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('uteplenie-penopleksom', 'interiors'),
    topCard1Title: 'Утепление Пеноплэксом лоджии 3 м',
    topCard1Subtitle: 'ЭППС 50 мм стены + пол + потолок + грибки',
    topCard1Price: 'от 13 200 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На Пеноплэкс, клей, грибки и целостность теплоизоляционного контура',
    aboutBadge: 'ЭППС vs ПСБ — разница принципиальная',
    aboutTitle: 'Пеноплэкс: почему ЭППС, а не обычный пенопласт',
    aboutImage: 'https://balkonreshenie.ru/uploads/thumbnail_uteplenie_balkonov_i_lodzhij_300x300_dd1cc9fb2a.jpg?updatedAt=2026-06-18T21%3A46%3A55.398Z',
    seoText: `Пеноплэкс и пенопласт (ПСБ) часто путают, хотя разница между ними принципиальная. Оба — полистирол, но разная технология производства: ПСБ — вспенивание паром, ЭППС (Пеноплэкс) — экструзия. Результат: ПСБ имеет открытую ячеистую структуру (вода проникает между шариками), ЭППС — закрытые ячейки 0,1–0,2 мм без сообщения между собой. Водопоглощение за 30 суток: ПСБ — 4%, ЭППС Пеноплэкс — 0,4%. В десять раз меньше. Для Омска с октябрьско-апрельским конденсатом на балконных стенах это означает: ПСБ намокает и теряет теплоизоляционные свойства, ЭППС держит λ=0,032 Вт/м·К на протяжении всего срока службы. Плотность Пеноплэкс СТАНДАРТ — 35 кг/м³, сопротивление сжатию при деформации 10% — 200 кПа. Для пола под стяжку это достаточно.

Технология монтажа начинается с подготовки основания. Бетонные стены балкона обеспыливаем щёткой и грунтуем составом Технониколь PRIMER (адгезия клея возрастает с 0,08 до 0,18 МПа). Клей CERESIT CT85 (морозостойкий, работает при −5°C) наносим по периметру плиты и 3–4 маяками в центре — это даёт контакт с основанием 60–70% площади плиты. Плиты Пеноплэкса 1 200×600×50 мм укладываем в разбежку (смещение вертикальных швов ≥150 мм), плотно прижимаем. После схватывания клея (24 часа) — механическое крепление грибками-дюбелями 10×120 мм: 4 штуки по углам + 1 в центре каждой плиты.

Швы между плитами — слабое место любого утепления. Зазоры >3 мм заполняем монтажной пеной Soudal Insta-Stik (однокомпонентная без изоцианатов — не разъедает пенополистирол). Зазоры 1–3 мм — Пеноплэксовый специальный клей без растворителей. Шов пеной нужно заполнять полностью: незаполненный шов толщиной 3 мм создаёт тепловой мост с R=0,004 м²·К/Вт — ничтожно мало, зато он ещё и продувается, что в разы хуже. Угловые примыкания Пеноплэкса к раме и стенам заделываем той же пеной с последующей обработкой Стиз-Б по периметру.

Расчёт толщины для Омска: требуемое сопротивление теплопередаче ограждений нежилых помещений по СП 50.13330 для Омска — 1,8 м²·К/Вт. Стена балкона (бетон 120 мм + штукатурка 15 мм): Rстен = 0,12/1,75 + 0,015/0,87 = 0,086 м²·К/Вт. Дефицит: 1,8 − 0,086 = 1,714. Толщина Пеноплэкса: δ = R·λ = 1,714·0,032 = 0,055 м → 55 мм, округляем до стандарта 50 мм (небольшой компромисс) или 60 мм (в запас). Именно поэтому мы применяем Пеноплэкс 50 мм как минимум.`,
    glazingCard: [
      {
        title: 'Пеноплэкс 50 мм — стены и потолок',
        price: '1 100',
        desc: 'ЭППС 35 кг/м³, λ=0,032 Вт/м·К. Клей CERESIT CT85 + грибки 10×120 мм ×5/м². Швы — монтажная пена Soudal Insta-Stik. Без растворителей.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_uteplenie_balkonov_i_lodzhij_300x300_dd1cc9fb2a.jpg?updatedAt=2026-06-18T21%3A46%3A55.398Z',
        badge: 'Основной слой',
      },
      {
        title: 'Пеноплэкс 50 мм — пол под стяжку',
        price: '1 000',
        desc: 'ЭППС 35 кг/м³ под стяжку М150. Сопротивление сжатию 200 кПа при деформации 10%. Держит вес стяжки + нагрузку эксплуатации.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_uteplenie_balkonov_i_lodzhij_300x300_dd1cc9fb2a.jpg?updatedAt=2026-06-18T21%3A46%3A55.398Z',
        badge: 'Под стяжку',
      },
      {
        title: 'Пеноплэкс 60 мм (увеличенный)',
        price: '1 300',
        desc: 'Толщина 60 мм для квартир на 1–2 этаже и угловых квартир с большей теплопотерей. R=1,87 м²·К/Вт — с запасом к норме СП 50.13330.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_uteplenie_balkonov_i_lodzhij_300x300_dd1cc9fb2a.jpg?updatedAt=2026-06-18T21%3A46%3A55.398Z',
        badge: 'Повышенное утепление',
      },
      {
        title: 'Пеноплэкс + Пенофол + отделка ПВХ',
        price: '3 300',
        desc: 'Полный «термос»: ЭППС 50 мм + Пенофол тип С + обрешётка + ПВХ-панели. R=2,1 м²·К/Вт. При −40°C без обогревателя на лоджии +5…+8°C.',
        img: CARD_IMG_A,
        badge: 'Под ключ «термос»',
      },
    ],
    StructureTab: [
      {
        tabName: 'ЭППС vs ПСБ',
        title: 'Почему ЭППС, а не обычный пенопласт',
        desc: 'Водопоглощение: ЭППС 0,4% vs ПСБ 4% (в 10 раз меньше). λ: ЭППС 0,032 vs ПСБ 0,041 Вт/м·К. В омском конденсате ПСБ намокает и теряет теплоизоляцию.',
        features: [
          'Водопоглощение ЭППС 0,4% — не теряет изоляцию в конденсате',
          'λ=0,032 Вт/м·К — на 22% лучше ПСБ',
          'Закрытые ячейки — не гниёт, не плесневеет',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Монтаж и крепление',
        title: 'Клей CERESIT CT85 + грибки 5 шт/м²',
        desc: 'Грунт → клей CT85 по периметру + 3 маяка (контакт 60–70%) → разбежка плит → грибки 10×120 мм ×5 шт → запенка швов Soudal без растворителей.',
        features: [
          'Грунтовка: адгезия клея 0,08→0,18 МПа',
          'Разбежка плит: смещение швов ≥150 мм',
          'Грибки ×5/м² — плиты не отрываются при ветре',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Расчёт толщины',
        title: 'Расчёт: почему 50 мм для Омска',
        desc: 'Требуемый R для Омска — 1,8 м²·К/Вт. Бетонная стена балкона даёт 0,086 м²·К/Вт. Дефицит 1,714 м²·К/Вт → δ = R·λ = 1,714·0,032 = 55 мм → принимаем 50 мм (компромисс) или 60 мм.',
        features: [
          'Нормативный R для Омска — 1,8 м²·К/Вт',
          'Бетон балкона покрывает только 0,086 м²·К/Вт',
          'Пеноплэкс 50 мм — минимум; 60 мм — в запас',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'uteplenie-penofolom': {
    slug: 'uteplenie-penofolom',
    name: 'Утепление балкона Пенофолом в Омске — пароизоляция и теплоотражение',
    seoDescription:
      'Утепление балкона Пенофолом в Омске: тип С (фольга с двух сторон), отражение 97% ИК-излучения, стыки лентой Nicoband 50 мм. Замкнутый пароизоляционный контур. От 900 ₽/м². Гарантия 5 лет!',
    heroBadge: '✨ Пенофол тип С — 97% ИК-отражение, замкнутый пароизоляционный контур',
    heroTitle: 'Пароизоляция и утепление лоджии в Омске',
    heroTitleHighlight: 'тепло остаётся внутри',
    heroDesc:
      'Монтируем фольгированную пароизоляцию поверх утеплителя — отражающий слой удерживает тепло и защищает стены от конденсата. Бесплатный выезд замерщика, производство на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('uteplenie-penofolom', 'interiors'),
    topCard1Title: 'Пенофол тип С для лоджии 3 м',
    topCard1Subtitle: 'Стены + потолок + пол + заделка стыков Nicoband',
    topCard1Price: 'от 10 800 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На Пенофол, монтаж и герметичность пароизоляционного контура',
    aboutBadge: 'Пенофол — второй слой системы «термос»',
    aboutTitle: 'Пенофол: как работает отражающая пароизоляция',
    aboutImage: 'https://balkonreshenie.ru/uploads/thumbnail_uteplenie_balkonov_i_lodzhij_300x300_dd1cc9fb2a.jpg?updatedAt=2026-06-18T21%3A46%3A55.398Z',
    seoText: `Пенофол часто воспринимают как самостоятельный утеплитель — и это главная ошибка. Пеноплолиэтилен (ПЭ) 5 мм имеет теплопроводность λ=0,049 Вт/м·К и толщину 5 мм: его тепловое сопротивление R = 0,005/0,049 = 0,10 м²·К/Вт. Для Омска (норматив R≥1,8 м²·К/Вт) это 5,6% от требуемого — ничтожно мало. Пенофол не является самостоятельным теплоизолятором для климата с −40°C. Его функция — пароизоляция и отражение инфракрасного (теплового) излучения. Фольгированный слой Пенофола отражает до 97% ИК-излучения, исходящего от тёплых поверхностей (стен квартиры, обогревателей). При этом работает только при наличии воздушного зазора ≥20 мм между фольгой и отделочным материалом: без зазора эффект теплоотражения практически нулевой.

Типы Пенофола: A (фольга с одной стороны) и C (фольга с двух сторон). Для балкона применяем тип C: одна фольгированная сторона обращена к Пеноплэксу (отражает холод, идущий из стены), вторая — к воздушному зазору и отделке (отражает тепло обратно в помещение). Самоклеящиеся виды Пенофола (тип ALP, B1) проще в монтаже, но адгезионный слой деградирует при циклических деформациях −40°C/+35°C — через 5–7 лет отслаивается. Используем самоклеящийся только как временный крепёж, основное крепление — скобы степлера шаг 200 мм.

Критический момент системы — герметичность стыков Пенофола. Если в пароизоляционном контуре есть щель, тёплый влажный воздух из квартиры проникает к холодным поверхностям (к Пеноплэксу и бетонной стене), конденсирует и увлажняет теплоизоляцию. При влажности Пеноплэкса 2% его λ возрастает с 0,032 до 0,038 Вт/м·К — потеря 19% теплоизоляционных свойств. Для герметизации стыков применяем ленту Nicoband шириной 50 мм: битумно-алюминиевая лента с диапазоном рабочих температур −50°C до +100°C. Стыки внахлёст 50 мм, прикатка шпателем. Примыкания к раме, стенам и полу: Nicoband 75 мм + прижимная рейка. Задача: ни одного открытого шва.

Последовательность укладки системы «термос»: 1) Пеноплэкс 50 мм на клей + грибки; 2) Пенофол тип C полотном, стыки встык (не внахлёст по полотну, внахлёст только по ленте), крепление скобами; 3) заделка стыков Nicoband 50 мм; 4) обрешётка из металлопрофиля CD 60 с дистанцером 20 мм (обеспечивает воздушный зазор между Пенофолом и профилем); 5) ПВХ-панели или евровагонка. Воздушный зазор 20 мм между Пенофолом и отделкой — обязательное условие работы отражающего слоя.`,
    glazingCard: [
      {
        title: 'Пенофол тип С — стены и потолок',
        price: '900',
        desc: 'Фольга с двух сторон, ПЭ 5 мм. Отражение 97% ИК. Крепление скобами + стыки Nicoband 50 мм. Воздушный зазор 20 мм под обрешётку.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_uteplenie_balkonov_i_lodzhij_300x300_dd1cc9fb2a.jpg?updatedAt=2026-06-18T21%3A46%3A55.398Z',
        badge: 'Пароизоляция',
      },
      {
        title: 'Пенофол + Nicoband (полный контур)',
        price: '1 200',
        desc: 'Пенофол тип С + заделка всех стыков лентой Nicoband 50 мм + примыкания к раме Nicoband 75 мм. Герметичный пароизоляционный контур без единой щели.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_uteplenie_balkonov_i_lodzhij_300x300_dd1cc9fb2a.jpg?updatedAt=2026-06-18T21%3A46%3A55.398Z',
        badge: 'Замкнутый контур',
      },
      {
        title: 'Пеноплэкс 50 мм + Пенофол тип С',
        price: '2 100',
        desc: 'Полная система: ЭППС 50 мм (основной теплобарьер) + Пенофол тип С с Nicoband (пароизоляция + ИК-отражение). R=2,1 м²·К/Вт.',
        img: CARD_IMG_A,
        badge: 'Полный «термос»',
      },
      {
        title: 'Система под ключ + отделка',
        price: '3 300',
        desc: 'Пеноплэкс + Пенофол + Nicoband + CD 60 + ПВХ-панели. При −40°C на лоджии +5°C без обогревателя. Монтаж 1–2 дня.',
        img: CARD_IMG_D,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Пенофол — НЕ утеплитель',
        title: 'R Пенофола 0,10 м²·К/Вт — это 5,6% от нормы',
        desc: 'Пеноплолиэтилен 5 мм: R=0,10 м²·К/Вт при норме Омска 1,8 м²·К/Вт. Самостоятельно не защищает от −40°C. Только в паре с Пеноплэксом 50 мм (R=1,56 м²·К/Вт).',
        features: [
          'Пенофол без Пеноплэкса — не защищает от мороза',
          'R=0,10 м²·К/Вт — 5,6% от нормативного значения',
          'Основная функция: пароизоляция + ИК-отражение',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Воздушный зазор 20 мм',
        title: 'Без зазора 20 мм ИК-отражение не работает',
        desc: 'Фольга отражает ИК-излучение только при наличии воздушного пространства. Зазор 20 мм между Пенофолом и отделочными панелями обеспечивается обрешёткой на CD 60 с дистанцером.',
        features: [
          'Зазор 20 мм — обязательное условие работы фольги',
          'CD 60 с дистанцером 20 мм обеспечивает зазор',
          'Без зазора — отражение ИК близко к нулю',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Nicoband — герметизация стыков',
        title: 'Лента Nicoband 50 мм: диапазон −50°C до +100°C',
        desc: 'Битумно-алюминиевая лента Nicoband — единственный надёжный материал для герметизации стыков Пенофола в условиях омских перепадов. Aluminium scotch деградирует при −40°C через 2–3 зимы.',
        features: [
          'Nicoband −50°C до +100°C — рабочий диапазон Омска',
          'Обычный алюминиевый скотч деградирует при −40°C',
          'Стыки внахлёст 50 мм + прикатка шпателем',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'zimnee-sovmeshchenie-s-komnatoy': {
    slug: 'zimnee-sovmeshchenie-s-komnatoy',
    name: 'Зимнее совмещение балкона с комнатой в Омске',
    seoDescription:
      'Совмещение балкона с комнатой в Омске: демонтаж подоконного блока, утепление «термос», выравнивание уровня пола, ИК тёплый пол вместо запрещённого переноса радиатора. Под ключ, гарантия 5 лет!',
    heroBadge: '🏡 Расширение жилой площади — законно, тепло, без бюрократии',
    heroTitle: 'Объединение балкона с комнатой в Омске',
    heroTitleHighlight: 'больше жилого пространства',
    heroDesc:
      'Полный цикл: тёплое остекление, утепление, демонтаж подоконного блока и отделка на одном уровне с комнатой. Помогаем согласовать работы с управляющей компанией. Бесплатный замер, завод на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('zimnee-sovmeshchenie-s-komnatoy', 'interiors'),
    topCard1Title: 'Совмещение лоджии 3 м с комнатой',
    topCard1Subtitle: 'Демонтаж + утепление + пол + ИК тёплый пол',
    topCard1Price: 'от 78 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На утепление, пол, тёплый пол и отделку',
    aboutBadge: 'Расширение без перепланировки по закону',
    aboutTitle: 'Совмещение с комнатой: тепло, законно, без переноса радиаторов',
    aboutImage: DEFAULT_ABOUT_IMG,
    seoText: `Совмещение лоджии с комнатой в Омске — это реальная возможность получить 3–6 дополнительных квадратных метров без перепланировки квартиры (демонтаж ненесущего подоконного блока не является перепланировкой по ст. 25 ЖК РФ и не требует согласования в большинстве жилых домов Омска). Конструктивно процесс состоит из 6 этапов: тёплое остекление лоджии, утепление «термос», демонтаж подоконного блока (дверная коробка + оконный блок с подоконником), выравнивание уровня пола, отделка объединённого пространства и организация отопления.

Главный вопрос клиентов при совмещении: «А можно перенести радиатор на балкон?» Ответ однозначный: нет. Перенос радиатора или подводящих труб на балкон прямо запрещён Постановлением Правительства РФ №354 от 06.05.2011 («Правила предоставления коммунальных услуг») и СНиП 41-01-2003 «Отопление, вентиляция и кондиционирование». Логика запрета: балкон не является отапливаемым помещением согласно проекту здания; перенос туда радиатора нарушает тепловой баланс стояка и ухудшает отопление соседних квартир. Управляющие компании Омска при обнаружении переноса выписывают предписание о демонтаже. Штраф — не главная проблема: зимой при аварии стояка промёрзший балкон даёт разрыв трубы и затопление соседей снизу.

Альтернатива радиатору — инфракрасный плёночный тёплый пол. Плёночный нагревательный элемент (CALEO Gold 170 Вт/м² или аналог) монтируется под ламинат с подложкой из вспененного полиэтилена. Потребление для лоджии 3 м (площадь 5–6 м² с учётом мебели и зон без нагрева) — 850–1 020 Вт·ч при работе 4–6 часов в сутки. Это около 4–6 кВт·ч/сутки или 120–180 кВт·ч/месяц при тарифе 3,5 руб/кВт·ч — 420–630 руб/месяц. Регулируется термостатом: программируемый режим «ночь/день/отсутствие» снижает расход на 30%. Монтаж плёнки занимает 2–3 часа, не требует стяжки.

Выравнивание пола — тонкий момент. Лоджия обычно ниже уровня пола квартиры на 40–80 мм. Варианты выравнивания: самовыравнивающаяся смесь Knauf Boden (δ=10–80 мм, поверхностная прочность 20 МПа), сухая стяжка фанерой 18 мм на лагах (быстро, без сушки), или цементная стяжка М150 (дешевле, но ждать 28 суток набора прочности). При совмещении с комнатой выбираем метод исходя из высотной разницы: до 40 мм — самовыравнивающаяся смесь, более 40 мм — лаги с фанерой (экономит высоту помещения).`,
    glazingCard: [
      {
        title: 'Тёплое остекление + утепление «термос»',
        price: '4 700',
        desc: 'ПВХ REHAU 5-кам. + Пеноплэкс 50 мм + Пенофол тип С + Nicoband. Первый этап совмещения. R=2,1 м²·К/Вт.',
        img: CARD_IMG_A,
        badge: 'Первый этап',
      },
      {
        title: 'Демонтаж подоконного блока',
        price: '8 500',
        desc: 'Демонтаж дверной коробки + оконного блока + подоконника. Заделка проёма (при необходимости расширение). Не является перепланировкой по ст. 25 ЖК РФ.',
        img: CARD_IMG_C,
        badge: 'Демонтаж',
      },
      {
        title: 'ИК тёплый пол CALEO 170 Вт/м²',
        price: '1 800',
        desc: 'Плёночный ИК нагреватель под ламинат. Потребление 850–1 020 Вт для лоджии 3 м. Термостат с программированием. Монтаж без стяжки.',
        img: CARD_IMG_D,
        badge: 'Вместо радиатора',
      },
      {
        title: 'Совмещение под ключ',
        price: '8 500',
        desc: 'Остекление + «термос» + демонтаж блока + выравнивание пола + ИК пол + ламинат + отделка. Готовая жилая комната за 4–5 дней.',
        img: CARD_IMG_B,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Демонтаж блока',
        title: 'Демонтаж подоконного блока — не перепланировка',
        desc: 'По ст. 25 ЖК РФ перепланировка — изменение конфигурации несущих конструкций. Подоконный блок (ненесущий) — не перепланировка. Согласование с управляющей компанией не требуется.',
        features: [
          'Не перепланировка — не требует согласования',
          'Демонтаж дверной коробки + окна + подоконника',
          'Заделка торцов проёма цементным составом',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'ИК пол вместо радиатора',
        title: 'Запрет переноса радиатора — решение: ИК плёнка',
        desc: 'Перенос радиатора запрещён ПП РФ №354 и СНиП 41-01. Штраф + обязательный демонтаж. Плёночный ИК CALEO 170 Вт/м² — легальная альтернатива. Монтаж под ламинат за 2–3 часа.',
        features: [
          'Перенос радиатора — нарушение ПП РФ №354',
          'ИК CALEO 170 Вт/м² — легально, без согласования',
          'Стоимость обогрева 420–630 руб/месяц при −25°C',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Выравнивание пола',
        title: 'Выравнивание пола: смесь или лаги с фанерой',
        desc: 'Разница уровней 40–80 мм. До 40 мм: Knauf Boden самовыравнивающийся. Более 40 мм: лаги + фанера 18 мм (без ожидания сушки). Под ИК плёнку — только сухой метод.',
        features: [
          'До 40 мм: Knauf Boden, сушка 24–48 часов',
          'Более 40 мм: лаги + фанера 18 мм, монтаж за 1 день',
          'ИК плёнка монтируется на сухой метод без стяжки',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'otdelka-pvh-panelyami': {
    slug: 'otdelka-pvh-panelyami',
    name: 'Отделка балкона ПВХ панелями в Омске',
    seoDescription:
      'Отделка балкона ПВХ-панелями в Омске: 8–10 мм на металлопрофиле CD 60 шаг 400 мм, Пенофол за обрешёткой, 120+ расцветок. Влагостойкость 100%, не желтеет. От 1 400 ₽/м². Гарантия 5 лет!',
    heroBadge: '💎 ПВХ-панели 8–10 мм — влагостойкость 100%, 120 расцветок',
    heroTitle: 'Отделка балкона панелями в Омске',
    heroTitleHighlight: 'быстро, практично, влагостойко',
    heroDesc:
      'Панели на обрешётку — аккуратная отделка без долгой сушки и запахов. Материал не боится перепадов температур и легко моется. Большой выбор цветов и фактур. Бесплатный замер, завод по ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('otdelka-pvh-panelyami', 'interiors'),
    topCard1Title: 'Отделка ПВХ-панелями лоджии 3 м',
    topCard1Subtitle: 'Стены + потолок + CD 60 + Пенофол',
    topCard1Price: 'от 16 800 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На панели, металлопрофиль и монтаж',
    aboutBadge: 'Практично и доступно',
    aboutTitle: 'ПВХ-панели: почему шаг обрешётки 400 мм, а не 600 мм',
    aboutImage: 'https://balkonreshenie.ru/uploads/thumbnail_Vnutrennyaya_otdelka_balkona_c5925c9216.png?updatedAt=2026-06-18T21%3A45%3A56.280Z',
    seoText: `ПВХ-панель для отделки балкона — не тот же ПВХ, что в окнах: это поливинилхлорид с наполнителями и пластификаторами, сформованный в плоские профили с внутренними рёбрами жёсткости. Толщина панели 8 мм означает расстояние от лицевой поверхности до оборотной, при этом стенки рёбер — 0,9–1,1 мм. Под точечной нагрузкой (например, при вдавливании) панель 8 мм прогибается. Именно поэтому шаг обрешётки критически важен. При шаге CD 60 профилей 600 мм расчётный прогиб панели 8 мм под нагрузкой 50 Па — 3,2 мм (заметна деформация). При шаге 400 мм — 0,9 мм (в 3,5 раза меньше). Поэтому мы используем шаг 400 мм для стен и 300 мм для потолка (потолочная панель испытывает постоянную нагрузку от собственного веса).

Металлопрофиль CD 60 для обрешётки предпочтительнее деревянной рейки в балконных условиях. Дерево в балконном микроклимате (перепады влажности 30–90%) набухает, усыхает и со временем коробится — вместе с ним деформируется весь облицовочный массив. Оцинкованный CD 60 (цинковое покрытие Г275 по ГОСТ 14918) сохраняет геометрию при влажности 100% и температурах от −60°C до +120°C. Крепление CD 60 к стене: прямые подвесы ПП 6×0,9 мм с шагом 500–600 мм + дюбели ∅6×40 мм в бетон. Уровень горизонтальности и вертикальности обрешётки проверяем лазерным уровнем — допуск ±2 мм/2 000 мм.

Пеноплол за обрешёткой — не опция, а функциональный элемент. Пенофол тип С крепится между обрешёткой и стеной: отражает ИК-тепло, служит пароизоляцией. Без него тёплый влажный воздух проникает за обрешётку, конденсируется на холодной бетонной стене и создаёт плесень. Этот сценарий мы видим в каждом третьем ремонтном заказе: предыдущий подрядчик поставил ПВХ-панели без пароизоляции, через 2–3 года — чёрный налёт плесени на бетоне за панелями. Для устранения нужно снять всю обшивку, обработать стену противогрибковым составом, уложить Пенофол и смонтировать заново.

Стыки и доборные профили — финальная деталь, по которой видна квалификация монтажников. Торцы стен закрываем J-образным профилем (заводит панель в паз), углы — угловым L-профилем 25×25 мм, примыкание к оконной раме — F-образным наличником. Все профили подбираем в цвет основной панели. Нахлёст панелей в замок шип-паз выполняем без силикона — панель расширяется при нагреве до +60°C на 0,06 мм/мм (для панели 600 мм это 3,6 мм), закреплённый силиконом стык трескается. Правильный монтаж: первая панель в J-профиле с зазором 3 мм, каждая следующая — только в замок без фиксации торца.`,
    glazingCard: [
      {
        title: 'ПВХ-панели 8 мм — стены и потолок',
        price: '1 400',
        desc: 'CD 60 шаг 400 мм + Пенофол тип С + ПВХ 8 мм. 120+ расцветок. Влагостойкость 100%. Монтаж за 1 день.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Vnutrennyaya_otdelka_balkona_c5925c9216.png?updatedAt=2026-06-18T21%3A45%3A56.280Z',
        badge: 'Хит продаж',
      },
      {
        title: 'ПВХ-панели 10 мм — повышенная прочность',
        price: '1 600',
        desc: 'CD 60 шаг 400 мм + ПВХ 10 мм. Жёсткость стенки рёбер 1,2 мм. Для зон с нагрузкой: стены около мебели, рабочие зоны.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Vnutrennyaya_otdelka_balkona_c5925c9216.png?updatedAt=2026-06-18T21%3A45%3A56.280Z',
        badge: 'Прочнее',
      },
      {
        title: 'ПВХ-панели + утепление Пеноплэксом',
        price: '2 800',
        desc: 'Пеноплэкс 50 мм + Пенофол тип С + CD 60 шаг 400 мм + ПВХ 8 мм. R=2,1 м²·К/Вт. При −40°C без обогревателя +5…+8°C.',
        img: CARD_IMG_A,
        badge: 'С утеплением',
      },
      {
        title: 'ПВХ-панели под ключ (стены + потолок + пол)',
        price: '3 200',
        desc: 'ПВХ стены + реечный потолок Cesal + ламинат 33 кл. + плинтус ПВХ. Готовая отделка лоджии 3 м за 2 дня.',
        img: CARD_IMG_D,
        badge: 'Три поверхности',
      },
    ],
    StructureTab: [
      {
        tabName: 'Шаг обрешётки 400 мм',
        title: 'Почему CD 60 с шагом 400, а не 600 мм',
        desc: 'При шаге 600 мм прогиб ПВХ 8 мм под нагрузкой 50 Па — 3,2 мм (видна деформация). При шаге 400 мм — 0,9 мм. Потолок: шаг 300 мм из-за постоянной нагрузки собственного веса.',
        features: [
          'Шаг 400 мм — прогиб 0,9 мм vs 3,2 мм при 600 мм',
          'Потолок — шаг 300 мм: нагрузка постоянная',
          'Уровень обрешётки: лазер, допуск ±2 мм/2 000 мм',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Металл vs дерево',
        title: 'CD 60 оцинкованный — не деревянная рейка',
        desc: 'Дерево в балконном климате (влажность 30–90%) коробится → деформация панелей. CD 60 Г275 (ГОСТ 14918) работает при −60°C→+120°C и влажности 100%. Подвесы ПП 6×0,9 мм шаг 500 мм.',
        features: [
          'Оцинковка Г275 — защита от ржавчины 100%',
          'Геометрия при влажности 100% — не меняется',
          'Подвесы ПП 6×0,9 мм шаг 500–600 мм',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Стыки панелей',
        title: 'Монтаж без силикона в замке шип-паз',
        desc: 'Тепловое расширение ПВХ 600 мм при ΔT=70°C — 2,5 мм. Силикон в замке треснет. Правильно: панель в J-профиль с зазором 3 мм + замок без фиксации торцов.',
        features: [
          'Расширение панели 600 мм при +60°C — 2,5 мм',
          'Силикон в замке — трещины через 1–2 сезона',
          'J-профиль + зазор 3 мм — компенсация расширения',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'vneshnij-sajding-parapeta': {
    slug: 'vneshnij-sajding-parapeta',
    name: 'Внешний сайдинг парапета балкона в Омске',
    seoDescription:
      'Внешняя обшивка парапета балкона сайдингом в Омске: виниловый Docke 1,2 мм или металлический сайдинг 0,5 мм с Polyester 25 мкм, вентзазор 30–40 мм, гидроизоляция монтажного шва. Гарантия 5 лет!',
    heroBadge: '🛡️ Внешний сайдинг парапета — защита бетона от влаги и мороза',
    heroTitle: 'Облицовка парапета балкона в Омске',
    heroTitleHighlight: 'защита и аккуратный фасад',
    heroDesc:
      'Облицовываем наружную часть парапета сайдингом — защита от влаги, мороза и трещин в бетоне. Фасад выглядит ухоженно, парапет служит дольше. Бесплатный выезд на замер, завод на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('vneshnij-sajding-parapeta', 'exteriors'),
    topCard1Title: 'Сайдинг парапета лоджии 3 м',
    topCard1Subtitle: 'Виниловый Docke + обрешётка + гидроизоляция',
    topCard1Price: 'от 10 800 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На сайдинг, обрешётку и герметизацию примыканий',
    aboutBadge: 'Защита парапета — инвестиция в несущую конструкцию',
    aboutTitle: 'Внешний сайдинг: защита бетона парапета от омских морозов',
    aboutImage: DEFAULT_ABOUT_IMG,
    seoText: `Незащищённый бетонный парапет в Омске деградирует по предсказуемому сценарию. Вода проникает в поры бетона и мелкие трещины от усадки. При замораживании вода расширяется на 9%, давление внутри трещины — 200 МПа. Прочность бетона М200 на растяжение — 1,4 МПа. То есть замерзающая вода разрывает бетон с давлением в 140 раз большим, чем он может выдержать. В Омске за зиму фиксируется 120–140 циклов перехода через 0°C — это 120–140 циклов морозного разрушения в год. Без защиты парапет превращается в трухлявый бетон за 8–12 лет. Именно здесь нужен сайдинг.

Вентилируемый фасад парапета состоит из трёх слоёв: оцинкованный профиль-обрешётка → вентиляционный зазор 30–40 мм → сайдинг. Оцинкованный профиль UD-27 крепится к парапету дюбелями ∅6 мм с шагом 600 мм. Вентиляционный зазор обязателен: без него конденсат, образующийся на холодной обрешётке, затекает за сайдинг и стекает вниз по стене. Минимальный зазор для эффективной конвекции — 25 мм, рекомендуемый — 30–40 мм. Внизу и вверху конструкции устанавливаем перфорированные уголки — для входа холодного воздуха снизу и выхода тёплого сверху.

Материал сайдинга: виниловый Docke Premium (ПВХ, толщина 1,15 мм, ширина планки 230 мм) или металлический (оцинкованная сталь 0,5 мм с Polyester 25 мкм покрытием). Разница в прочности и сроке службы: виниловый становится хрупким при −30°C (при ударе может треснуть), металлический работает при −60°C. Однако виниловый не корродирует совсем, а металлический при повреждении Polyester-покрытия корродирует в зонах царапин. Для Омска рекомендуем металлический сайдинг для первых трёх этажей (где риск механических повреждений выше) и виниловый Docke для 4 и выше.

Гидроизоляция монтажного шва — критичная точка. Шов между сайдингом и стеной здания (горизонтальный шов сверху парапета и вертикальные примыкания к остеклению) обрабатываем в три слоя: гидроизоляционная лента Технониколь PLANIFLEX 100 мм + металлический отлив из оцинкованной стали 0,7 мм + силиконовый герметик Soudal Silirub-N в торцевой шов. Отлив устанавливается с уклоном 5° от стены — вода не застаивается. Финальная проверка: полив водой из шланга при закрытых окнах — течей нет.`,
    glazingCard: [
      {
        title: 'Виниловый сайдинг Docke Premium',
        price: '1 800',
        desc: 'ПВХ 1,15 мм, ширина 230 мм. UD-27 обрешётка + вентзазор 30 мм. Отлив оцинкованный 0,7 мм + Soudal Silirub. Срок службы 30 лет.',
        img: CARD_IMG_A,
        badge: 'Популярный',
      },
      {
        title: 'Металлический сайдинг — сталь 0,5 мм',
        price: '2 200',
        desc: 'Оцинкованная сталь 0,5 мм с Polyester 25 мкм. Работает при −60°C. Устойчив к механическим ударам. Для 1–3 этажей и промышленных зон Омска.',
        img: CARD_IMG_C,
        badge: 'Ударопрочный',
      },
      {
        title: 'Сайдинг + гидроизоляция примыканий',
        price: '2 800',
        desc: 'Docke или металл + PLANIFLEX 100 мм + металлический отлив с уклоном 5° + Soudal в торцевой шов. Полная гидроизоляция. Тест дождём перед сдачей.',
        img: CARD_IMG_B,
        badge: 'С гидроизоляцией',
      },
      {
        title: 'Сайдинг парапета + внутренняя отделка',
        price: '3 500',
        desc: 'Внешний сайдинг + ПВХ-панели или евровагонка изнутри. Полная облицовка парапета с двух сторон. Защита бетона снаружи + интерьер изнутри.',
        img: CARD_IMG_D,
        badge: 'Снаружи + изнутри',
      },
    ],
    StructureTab: [
      {
        tabName: 'Вентилируемый фасад',
        title: 'Три слоя: обрешётка → зазор 30 мм → сайдинг',
        desc: 'UD-27 на дюбелях ∅6 мм шаг 600 мм → зазор 30–40 мм → сайдинг. Нижний и верхний перфорированные уголки для конвекции. Конденсат уходит, не затекает.',
        features: [
          'Вентзазор 30–40 мм: минимум 25 мм для конвекции',
          'Перфорированные уголки снизу и сверху',
          'UD-27 дюбели ∅6 мм шаг 600 мм',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Виниловый vs металлический',
        title: 'Выбор материала сайдинга для Омска',
        desc: 'Виниловый Docke хрупок при −30°C (риск трещин от удара). Металлический работает при −60°C. Рекомендация: металл 1–3 этажа, Docke 4 этаж и выше (меньше механических рисков).',
        features: [
          'Металл 0,5 мм Polyester — ниже 4 этажа',
          'Docke 1,15 мм ПВХ — 4 этаж и выше',
          'Оба варианта: вентзазор 30 мм обязателен',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Гидроизоляция швов',
        title: 'PLANIFLEX + металлический отлив с уклоном 5°',
        desc: 'Гидролента PLANIFLEX 100 мм на горизонтальный шов парапета + оцинкованный отлив 0,7 мм с уклоном 5° + Soudal Silirub-N в торец. Тест: полив шлангом — течей нет.',
        features: [
          'PLANIFLEX 100 мм на шов + отлив 0,7 мм',
          'Уклон отлива 5° — вода не застаивается',
          'Финальный тест шлангом перед сдачей',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'ukladka-pola-i-laminata': {
    slug: 'ukladka-pola-i-laminata',
    name: 'Укладка пола и ламината на балконе в Омске',
    seoDescription:
      'Укладка пола и ламината на балконе в Омске: лаги по лазерному уровню шаг 400 мм, фанера 18 мм, ламинат 33 класс (AC5 по EN 13329), зазор 8–10 мм по периметру. От 900 ₽/м². Гарантия 5 лет!',
    heroBadge: '🪵 Ламинат 33 класс — лаги по лазеру, зазор 8 мм, монтаж за 1 день',
    heroTitle: 'Укладка пола на балконе в Омске',
    heroTitleHighlight: 'ровный пол — основа комфорта',
    heroDesc:
      'Выравниваем основание и укладываем ламинат, линолеум или доску — по желанию подключаем тёплый пол. Аккуратные плинтуса и чистовая отделка. Бесплатный замер, производство на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('ukladka-pola-i-laminata', 'interiors'),
    topCard1Title: 'Укладка пола + ламинат на лоджии 3 м',
    topCard1Subtitle: 'Лаги + фанера 18 мм + ламинат 33 класс + плинтус',
    topCard1Price: 'от 10 800 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На лаги, фанеру, ламинат и плинтусные примыкания',
    aboutBadge: 'Точность лаг = качество финишного пола',
    aboutTitle: 'Укладка ламината: почему 33 класс и почему зазор 8 мм',
    aboutImage: DEFAULT_ABOUT_IMG,
    seoText: `Пол на балконе — самая нагруженная поверхность: её топчут ногами в уличной обуви, на неё ставят тяжёлые вещи, она испытывает максимальные перепады температур (непосредственно контактирует с холодной балконной плитой). Ошибки при укладке пола — самые заметные: неровности, скрип, вздутие ламината. Все они имеют одну причину — некачественную подготовку основания. Рассказываем, как делаем мы.

Технология сухого пола на лагах: предпочтительна для балконов с разницей уровня >40 мм (когда нивелирование стяжкой нецелесообразно из-за веса) или при необходимости скрыть утепление под полом. Лаги — брус хвойных пород 50×50 мм с влажностью ≤12% (обязательно: сухой лес, иначе при высыхании лаги выкручивает и пол начинает скрипеть). Пропитка лаг биозащитным составом Neomid 430 — защита от грибка и насекомых. Шаг лаг 400 мм (для фанеры 18 мм под ламинат) — прогиб фанеры 18 мм при шаге 400 мм под нагрузкой 1,5 кПа (150 кг/м²) составляет 0,8 мм, что соответствует требованию СП 29.13330 «Полы» (не более 1 мм). При шаге 600 мм прогиб — 2,7 мм (недопустимо).

Выравнивание лаг — ключевая операция. Используем лазерный уровень с точностью 0,2 мм/м (приборы Bosch GLL 3-80 C или аналог). Каждая лага выставляется по лазерному лучу через регулируемые винтовые анкеры h=40–120 мм: вращением гайки добиваемся прилегания верхней плоскости лаги к лазерному лучу с точностью ±0,5 мм. После выставки все лаги проверяем правилом 2 м — отклонение не более 2 мм. Фанера ФК (фанера клеёная) 18 мм укладывается листами 1 500×750 мм в разбежку (смещение швов ≥250 мм), крепится саморезами 4×50 мм с шагом 250 мм к лагам.

Ламинат 33 класса (AC5 по EN 13329) — единственный правильный выбор для балкона. Класс 33 предназначен для коммерческих помещений с интенсивной нагрузкой: толщина защитного слоя (оверлея) 0,6 мм. Ламинат 31 класса (оверлей 0,2 мм) — для жилых спален — на балконе протирается насквозь за один-два сезона. Зазор у стен 8–10 мм: ламинат при нагреве с −40°C до +20°C (разница 60°C) расширяется: δ = α·L·ΔT = 0,000035·3 000·60 = 6,3 мм. Зазор 8–10 мм перекрывает это расширение с запасом. Без зазора ламинат упирается в стену, вздувается «волной» через первую же зиму. Зазор скрывается плинтусом ПВХ с кабель-каналом — функционально и эстетично.`,
    glazingCard: [
      {
        title: 'Лаги + фанера 18 мм (черновой пол)',
        price: '900',
        desc: 'Лаги 50×50 мм шаг 400 мм по лазерному уровню ±0,5 мм + биозащита Neomid 430 + фанера ФК 18 мм в разбежку. Саморезы 4×50 мм шаг 250 мм.',
        img: CARD_IMG_C,
        badge: 'Основание',
      },
      {
        title: 'Ламинат 33 класс (AC5) 8 мм',
        price: '800',
        desc: 'Ламинат 33 класс EN 13329, оверлей 0,6 мм. Подложка ПЭ 3 мм. Зазор 8–10 мм. Плинтус ПВХ с кабель-каналом. Монтаж за полдня.',
        img: CARD_IMG_A,
        badge: 'Хит продаж',
      },
      {
        title: 'Пеноплэкс 50 мм под лаги + ламинат',
        price: '1 700',
        desc: 'Пеноплэкс 50 мм под лаги + лаги по лазеру + фанера 18 мм + ламинат 33 кл. Пол не промерзает при −40°C снаружи. Суммарный R пола = 2,1 м²·К/Вт.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_uteplenie_balkonov_i_lodzhij_300x300_dd1cc9fb2a.jpg?updatedAt=2026-06-18T21%3A46%3A55.398Z',
        badge: 'Тёплый пол',
      },
      {
        title: 'Пол под ключ + ИК тёплый пол',
        price: '2 600',
        desc: 'Лаги + фанера + ИК плёнка CALEO 170 Вт/м² + подложка + ламинат 33 кл. + плинтус. Пол тёплый при включении за 15 минут.',
        img: CARD_IMG_D,
        badge: 'С ИК подогревом',
      },
    ],
    StructureTab: [
      {
        tabName: 'Лаги по лазерному уровню',
        title: 'Выравнивание лаг по лазеру — точность ±0,5 мм',
        desc: 'Лазерный уровень Bosch GLL 3-80 C (0,2 мм/м). Каждая лага — регулируемый винтовой анкер h=40–120 мм. Правило 2 м: допуск ±2 мм. Влажность лаг ≤12% — иначе скрип.',
        features: [
          'Лазер 0,2 мм/м — каждая лага по лучу ±0,5 мм',
          'Регулируемые анкеры: шаг 40–120 мм без клиньев',
          'Влажность бруса ≤12% — проверка влагомером',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Шаг лаг 400 мм',
        title: 'Почему шаг 400 мм, а не 600 мм',
        desc: 'Фанера 18 мм при шаге 600 мм и нагрузке 150 кг/м² прогибается на 2,7 мм (норма СП 29 — 1,0 мм). При шаге 400 мм — 0,8 мм. Шаг 400 мм обязателен для ламинатного пола.',
        features: [
          'Шаг 400 мм: прогиб 0,8 мм — в норме СП 29.13330',
          'Шаг 600 мм: прогиб 2,7 мм — недопустимо',
          'Фанера ФК 18 мм в разбежку — швы не совпадают',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Зазор 8 мм у стен',
        title: 'Зазор 8–10 мм — расширение ламината при −40°C→+20°C',
        desc: 'Расширение ламината 3 000 мм при ΔT=60°C — 6,3 мм. Зазор 8–10 мм — с запасом. Без зазора ламинат вздувается «волной» через первую зиму. Скрывается плинтусом ПВХ.',
        features: [
          'Расширение 3 000 мм при ΔT=60°C — 6,3 мм',
          'Зазор 8–10 мм — запас 1,7–3,7 мм сверх расширения',
          'Плинтус ПВХ с кабель-каналом скрывает зазор',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  // ── БАТЧ №4: МЕБЕЛЬ, НОВОСТРОЙКИ, СТАЛИНКИ, КОТТЕДЖИ, БЛОКИ, ОКНА, ВЫНОС ──

  'vstroennaya-mebel-i-shkafy': {
    slug: 'vstroennaya-mebel-i-shkafy',
    name: 'Встроенная мебель и шкафы на балкон в Омске',
    seoDescription:
      'Встроенная мебель и шкафы на балкон в Омске: ЛДСП класса E1, каркас из бруса 50×50 мм с биозащитой, петли Hettich 120°. Индивидуальный проект по размерам лоджии. Гарантия 5 лет!',
    heroBadge: '🗄️ Мебель по размерам лоджии — ЛДСП E1, влагостойкий ПВХ, без зазоров',
    heroTitle: 'Встроенная мебель на балконе в Омске',
    heroTitleHighlight: 'каждый сантиметр работает',
    heroDesc:
      'Изготавливаем шкафы, тумбы, полки, рабочие столы и сушилки точно по размерам вашей лоджии — никаких зазоров и пустых углов. Бесплатный выезд замерщика, завод по ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('vstroennaya-mebel-i-shkafy', 'interiors'),
    topCard1Title: 'Шкаф на балкон 3 м (до потолка)',
    topCard1Subtitle: 'ЛДСП E1 + ABS 1 мм + петли Hettich + монтаж',
    topCard1Price: 'от 12 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На корпус, фасады, петли и монтаж',
    aboutBadge: 'Индивидуальный проект по замерам лоджии',
    aboutTitle: 'Встроенная мебель: каждый сантиметр работает на хранение',
    aboutImage: DEFAULT_ABOUT_IMG,
    seoText: `Встроенная мебель на балконе — принципиально иной класс задач, чем стандартная корпусная мебель для квартиры. Балконный микроклимат: перепады температур от −40°C зимой до +35°C летом, влажность от 25% (морозная зима) до 90% (осень и весна). Обычный ДСП с меламиновым покрытием в этих условиях набухает по кромкам уже через первую зиму. Применяем ЛДСП класса эмиссии E1 (ГОСТ 10632-2014, содержание формальдегида ≤8 мг/100 г плиты) толщиной 18 мм с торцевой облицовкой ABS-пластиком 1 мм, приклеенным горячим расплавом ПУ-клея при 180°C. Адгезия ABS к ДСП после такого склеивания — 8 Н/мм по ГОСТ 15898, разрыв происходит по телу ДСП, но не по клеевому шву. Влага не проникает в торец.

Несущий каркас встроенного шкафа — отдельный конструктив, прикреплённый к стенам, полу и потолку лоджии. Каркас из бруса 50×50 мм хвойных пород (ель, сосна) с влажностью ≤12% обрабатываем биозащитным составом Neomid 430 (активный компонент — терефталат меди, действие 30 лет). Крепление к бетонным стенам: анкеры-дюбели ∅8×80 мм, шаг 400 мм по вертикальным стойкам и 600 мм по горизонтальным ригелям. Расчётная нагрузка на одно крепление при максимальной загрузке шкафа 200 кг (одежда + инструменты + сезонные вещи): 200/8 = 25 кг на анкер. Вырывающее усилие анкера ∅8×80 мм в бетоне М200 — 5,2 кН (520 кг). Коэффициент запаса 20,8 — с многократным перекрытием.

Фасады шкафа — ключевой эстетический элемент. На выбор: МДФ с плёночным покрытием CPL (толщина плёнки 0,5 мм, стойкость к истиранию AC3), ПВХ-пластик 18 мм (100% влагостоек, мойка), крашеный МДФ эмалью RAL. Петли Hettich Sensys (Германия) или Blum Clip Top (Австрия) — встроенный доводчик, угол открывания 120°, нагрузка на пару петель 15 кг, гарантийный ресурс 100 000 циклов. Это 137 открываний в день в течение 2 лет — заведомо больше реальной нагрузки. Полки выдерживают равномерную нагрузку 25 кг (регулируемые шурупы-полкодержатели из нержавейки).

Потолочная сушилка Лифт — популярное дополнение к шкафу. Система из двух алюминиевых рельсов на потолке и 4 верёвок с подъёмным механизмом. Максимальная нагрузка: 15 кг (производитель Leifheit или GIMI). Крепление рельсов: анкеры М8 в потолочную плиту. Высота подъёма рег: от 30 до 150 см. Монтаж сушилки — 40 минут. Устанавливаем одновременно со шкафом, без повторного выезда.`,
    glazingCard: [
      {
        title: 'Шкаф до потолка — ЛДСП E1 18 мм',
        price: '900',
        desc: 'Корпус ЛДСП E1 18 мм + фасады МДФ CPL + петли Hettich 120° 100 000 циклов + полкодержатели нержавейка. Индивидуальный проект по замерам.',
        img: CARD_IMG_C,
        badge: 'Хит продаж',
      },
      {
        title: 'Тумба под подоконником',
        price: '700',
        desc: 'ЛДСП E1 18 мм + ABS 1 мм + петли Blum + 2 полки. Встраивается в нишу под подоконником — каждый сантиметр в деле.',
        img: CARD_IMG_A,
        badge: 'Используем нишу',
      },
      {
        title: 'Рабочий стол + полки',
        price: '1 100',
        desc: 'Столешница ЛДСП 28 мм + ножки стальные 60×60 мм + навесные полки. Рабочий кабинет на балконе за 1 день.',
        img: CARD_IMG_B,
        badge: 'Рабочее место',
      },
      {
        title: 'Шкаф + сушилка Лифт + освещение',
        price: '1 400',
        desc: 'Шкаф до потолка + сушилка Leifheit 15 кг + LED-лента 4 000 K за карнизом. Полноценная функциональная зона на лоджии.',
        img: CARD_IMG_D,
        badge: 'Максимум функций',
      },
    ],
    StructureTab: [
      {
        tabName: 'Корпус ЛДСП E1',
        title: 'ЛДСП класса E1 — единственный выбор для балкона',
        desc: 'Класс E1: формальдегид ≤8 мг/100 г по ГОСТ 10632-2014. Торцы ABS 1 мм на ПУ-клее при 180°C — адгезия 8 Н/мм, разрыв по ДСП, не по шву. Влага не проникает в торец 10+ лет.',
        features: [
          'ЛДСП E1: формальдегид ≤8 мг/100 г — безопасно',
          'ABS 1 мм на ПУ-клее — торец защищён от влаги',
          'Полки 18 мм — равномерная нагрузка 25 кг',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Несущий каркас',
        title: 'Брус 50×50 мм с Neomid 430 — основа конструкции',
        desc: 'Брус 50×50 мм, влажность ≤12%, пропитка Neomid 430 (действие 30 лет). Анкеры ∅8×80 мм шаг 400 мм в вертикаль. Нагрузка 25 кг/анкер при запасе прочности ×20,8.',
        features: [
          'Neomid 430: терефталат меди, 30 лет биозащиты',
          'Анкеры ∅8×80 мм — вырывание 520 кг, нагрузка 25 кг',
          'Влажность бруса ≤12% — не коробится и не скрипит',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Петли и фурнитура',
        title: 'Петли Hettich Sensys — 100 000 циклов',
        desc: 'Hettich Sensys или Blum Clip Top: встроенный доводчик, угол 120°, ресурс 100 000 циклов = 137 открываний/день в течение 2 лет. Фасады МДФ CPL или ПВХ 18 мм.',
        features: [
          'Hettich Sensys — 100 000 циклов без разрегулировки',
          'МДФ CPL: плёнка 0,5 мм AC3 — устойчива к царапинам',
          'ПВХ 18 мм: влагостойкость 100% — для открытых лоджий',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'zamena-ostekleniya-v-novostrojke': {
    slug: 'zamena-ostekleniya-v-novostrojke',
    name: 'Замена остекления балкона в новостройке Омска',
    seoDescription:
      'Замена застройщического остекления балкона в новостройке Омска без изменения внешнего облика ЖК: новый ПВХ-профиль того же RAL-цвета, монтаж по ГОСТ 30971, промышленный альпинизм с фасада. Гарантия 5 лет!',
    heroBadge: '🏗️ Замена в новостройке — тот же RAL, без штрафов от УК',
    heroTitle: 'Замена остекления в новостройке Омска',
    heroTitleHighlight: 'тёплые рамы вместо холодного от застройщика',
    heroDesc:
      'Демонтируем некачественное остекление застройщика и ставим тёплые рамы в цвет фасада — без претензий от управляющей компании. Работаем во всех новостройках города. Бесплатный замер, завод на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('zamena-ostekleniya-v-novostrojke', 'exteriors'),
    topCard1Title: 'Замена остекления балкона 3 м в новостройке',
    topCard1Subtitle: 'Демонтаж + ПВХ REHAU 5-кам. + цвет RAL по запросу',
    topCard1Price: 'от 39 600 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На профиль, стеклопакет и монтажный шов',
    aboutBadge: 'Тот же цвет — другое качество',
    aboutTitle: 'Новостройка: меняем застройщика без конфликта с УК',
    aboutImage: 'https://balkonreshenie.ru/uploads/thumbnail_Plastikovoe_okno_a67ec4ad8e.jpg?updatedAt=2026-06-18T21%3A49%3A13.314Z',
    seoText: `Застройщик в Омске экономит на остеклении балконов системно. Типовой вариант: алюминиевый профиль 1,0 мм (вместо нормативных 1,2–1,5 мм) с однокамерным стеклом 6 мм без стеклопакета. Тепловое сопротивление такого остекления Rf = 0,06 м²·К/Вт — ничтожно по сравнению с требованием 1,8 м²·К/Вт для Омска. При −30°C на внутренней поверхности алюминиевого профиля и стекла образуется лёд — это не дефект монтажа, это предсказуемое физическое следствие выбора материала. Кроме того, застройщики ставят профиль без выравнивания по лазеру: отклонения 5–10 мм создают зазоры в монтажном шве, через которые задувает снег.

Главная сложность замены остекления в новостройке — требование управляющей компании к сохранению единого облика фасада ЖК. Согласно ст. 36 ЖК РФ и Правилам содержания общего имущества (ПП РФ №491 от 13.08.2006), любое изменение внешнего вида балкона (цвет, форма, материал профиля) является изменением общего имущества и требует согласования с 2/3 голосов собственников. На практике это означает: поставить белый ПВХ вместо серого алюминия — нарушение, штраф 2 000–2 500 руб. плюс предписание о демонтаже. Мы решаем эту задачу технически: заказываем ПВХ-профиль с ламинацией под нужный цвет RAL (доступно более 200 цветов по каталогу REHAU Color Collection) или с анодированием под алюминий. Визуально — тот же фасад, инженерно — принципиально другое качество.

Монтаж в новостройке отличается от стандартного: квартиры на высоких этажах (омские ЖК «Флагман», «Маяк», «Арена», «Победа» имеют 14–25 этажей) требуют работы с фасада при демонтаже и установке наружных элементов. Применяем промышленный альпинизм: снаряжение PETZL и Skylotec, страховочные точки через сертифицированные анкеры в бетонные конструкции кровли. Монтажник-альпинист выполняет наружную заделку монтажного шва ПСУЛ и силиконом — без этого внешний торец шва не загерметизировать при установке рамы изнутри. Работы на высоте выполняются только в безветренную погоду при скорости ветра ≤7 м/с.

Двухконтурное уплотнение REHAU/VEKA — ключевое преимущество замены. Застройщический алюминий имеет один контур ворсового уплотнителя (pile). ПВХ-системы REHAU Grazio и VEKA Softline 82 мм оснащены двумя контурами EPDM-уплотнителя (по периметру рамы и по периметру створки): коэффициент воздухопроницаемости системы снижается до класса A4 по ГОСТ 23166 (≤ 0,01 м³/ч·м при давлении 100 Па). Для сравнения: однокомпонентный ворсовый уплотнитель алюминия даёт класс A2 (≤ 0,10 м³/ч·м) — воздухообмен через уплотнение в 10 раз выше.`,
    glazingCard: [
      {
        title: 'Замена на ПВХ REHAU — цвет RAL',
        price: '3 300',
        desc: 'Демонтаж застройщика + REHAU Grazio 82 мм, 5 кам., RAL по запросу (200+ цветов). Двухкамерный стеклопакет i-стекло + аргон. Двойной EPDM.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Plastikovoe_okno_a67ec4ad8e.jpg?updatedAt=2026-06-18T21%3A49%3A13.314Z',
        badge: 'Тот же цвет',
      },
      {
        title: 'Замена на VEKA Softline 82 — белый',
        price: '3 100',
        desc: 'VEKA Softline 82 мм белый + двухкамерный 4-14Ar-4-14Ar-4. Класс воздухопроницаемости A4 по ГОСТ 23166. Монтаж за 1 день.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Plastikovoe_okno_a67ec4ad8e.jpg?updatedAt=2026-06-18T21%3A49%3A13.314Z',
        badge: 'Белый стандарт',
      },
      {
        title: 'Замена + утепление «термос»',
        price: '4 800',
        desc: 'ПВХ замена + Пеноплэкс 50 мм + Пенофол тип С + Nicoband. R=2,1 м²·К/Вт. При −40°C без обогревателя +5…+8°C на балконе.',
        img: CARD_IMG_A,
        badge: 'С утеплением',
      },
      {
        title: 'Замена под ключ (высотный дом)',
        price: '6 500',
        desc: 'Промальп + демонтаж + ПВХ RAL + утепление + ПВХ-отделка + ламинат. Полный цикл без подрядчиков, фиксированная смета.',
        img: CARD_IMG_D,
        badge: 'Высотный объект',
      },
    ],
    StructureTab: [
      {
        tabName: 'Цвет RAL — без штрафа от УК',
        title: 'Ламинация ПВХ под цвет ЖК — ст. 36 ЖК РФ',
        desc: 'По ПП РФ №491 изменение цвета остекления — изменение общего имущества. REHAU Color Collection: 200+ цветов RAL, декоры под металл и дерево. Внешний вид фасада неизменен.',
        features: [
          'ПП РФ №491: цвет балкона — общее имущество ЖК',
          'REHAU Color Collection: 200+ цветов и декоров',
          'Визуально идентично застройщику — без штрафа',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Промышленный альпинизм',
        title: 'Альпинистские работы при демонтаже с фасада',
        desc: 'Снаряжение PETZL и Skylotec, анкеры в бетон кровли. Наружная заделка ПСУЛ + силикон с фасада. Ветер ≤7 м/с. Работаем на объектах 14–25 этажей Омска.',
        features: [
          'PETZL / Skylotec — сертифицированное снаряжение',
          'Анкеры в бетон кровли, не хомуты на перила',
          'Ветер ≤7 м/с — безопасная работа с фасада',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Двойной EPDM vs ворсовый',
        title: 'Воздухопроницаемость A4 vs A2 у застройщика',
        desc: 'REHAU/VEKA: двойной EPDM, класс A4 ≤0,01 м³/ч·м при 100 Па. Застройщик: pile-уплотнитель, класс A2 ≤0,10 м³/ч·м. Разница: воздухообмен через уплотнение ×10.',
        features: [
          'REHAU Grazio: A4 ≤0,01 м³/ч·м — в 10 раз лучше',
          'Двойной EPDM по периметру рамы и створки',
          'Класс A4 по ГОСТ 23166 — высший стандарт',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'osteklenie-v-stalinke': {
    slug: 'osteklenie-v-stalinke',
    name: 'Остекление балконов в Сталинках Омска',
    seoDescription:
      'Остекление балконов в сталинках Омска: потолки 3,2–3,5 м, рамы высотой до 3 200 мм. Обследование консольной плиты, усиление стальным швеллером С245 и уголком 80×80×8 мм. Гарантия 5 лет!',
    heroBadge: '🏛️ Сталинки Омска — высокие рамы 3 200 мм, усиление швеллером С245',
    heroTitle: 'Остекление балконов в сталинках Омска',
    heroTitleHighlight: 'учитываем высокие потолки и толстые стены',
    heroDesc:
      'Сталинские дома требуют индивидуального подхода: высокие проёмы, массивные парапеты и нестандартные размеры. Делаем проект под каждую квартиру. Бесплатный выезд на замер, завод по ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('osteklenie-v-stalinke', 'exteriors'),
    topCard1Title: 'Остекление балкона в сталинке 3 м',
    topCard1Subtitle: 'Обследование + усиление швеллером + ПВХ 3 200 мм',
    topCard1Price: 'от 52 500 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На усиление плиты, профиль и монтаж',
    aboutBadge: 'Специализация на старом фонде Омска',
    aboutTitle: 'Сталинки: высокие плиты, разрушенный бетон, архитектурный декор',
    aboutImage: DEFAULT_ABOUT_IMG,
    seoText: `Сталинские дома Омска — улицы Маркса, Ленина, Гагарина, площадь Ленина и прилегающие кварталы — строились с 1938 по 1956 год по проектам, предполагавшим потолки 3,2–3,5 м и монументальные консольные балконы с декоративными балясинами и лепниной. Консольные плиты сталинок сделаны из армированного бетона, уложенного вручную (!) без вибрирования, с арматурой А-I диаметром 12–16 мм. Эти плиты простояли 70–85 лет, но за это время бетон карбонизировался на глубину 30–50 мм, арматура в зонах трещин ржавела, расширяясь в объёме и раскалывая защитный слой. Перед остеклением — обязательное обследование: зондирование в 3–5 точках на глубину карбонизации, простукивание всей поверхности, визуальный осмотр арматуры в зонах сколов.

Если обследование выявило потерю несущей способности плиты более 30%, приступаем к усилению. Технология для сталинок: стальной швеллер 14У (ГОСТ 8240-97, высота 140 мм, сталь С245, масса 16,3 кг/м) укладывается под плиту поперёк консоли с шагом 600–800 мм. Швеллер анкеруется в несущую стену здания химическими анкерами Hilti HIT-RE 500 V4 ∅16 мм на глубину 200 мм. Расчётная несущая способность одного швеллера на консоли 1 200 мм — 2,4 кН, что перекрывает нормативную нагрузку от остекления и снега (0,8 кН) с коэффициентом запаса 3. В зонах угловых трещин дополнительно устанавливаем накладку из уголка 80×80×8 мм (С245) с анкерованием в стену и плиту.

Рама для сталинского балкона высотой 3 200 мм — нестандартный размер, который не производится в типовом диапазоне. Изготавливаем на нашем заводе по ул. Гусарова: профиль REHAU Grazio 82 мм с усиленным армирующим вкладышем из стали 3 мм (С345). Прогиб ПВХ-профиля высотой 3 200 мм при температурном расширении ΔT=60°C: δ_T = α·L·ΔT = 0,00007·3 200·60 = 13,4 мм — значительная деформация. Компенсируем её тремя мерами: верхний компенсационный зазор 15 мм под ПСУЛ, армированный профиль (ограничивает прогиб в плоскости рамы), и угловые накладки из оцинкованной стали в местах примыкания к стенам.

Архитектурный декор сталинок — балясины, лепной карниз, профилированные тяги — требует особой осторожности при монтаже: демонтаж исторического декора формально является нарушением федерального закона №73-ФЗ «Об объектах культурного наследия», если дом состоит на охране (в Омске это 14 сталинских домов по Перечню). Мы никогда не сносим декор при монтаже: рама устанавливается внутрь ограждения, не затрагивая наружный декоративный пояс. При необходимости — изготавливаем фигурный нижний стартовый профиль, повторяющий контур балясин.`,
    glazingCard: [
      {
        title: 'Обследование плиты сталинки',
        price: '3 500',
        desc: 'Зондирование 3–5 точек, измерение глубины карбонизации, визуальный осмотр арматуры. Заключение с рекомендацией по усилению. Стоимость зачитывается при заказе.',
        img: CARD_IMG_C,
        badge: 'Первый шаг',
      },
      {
        title: 'Усиление швеллером 14У С245',
        price: '12 000',
        desc: 'Швеллер 14У шаг 600–800 мм + Hilti HIT-RE ∅16 мм в несущую стену 200 мм. Несущая способность 2,4 кН/швеллер — запас ×3 к нагрузке от рамы.',
        img: CARD_IMG_C,
        badge: 'Усиление',
      },
      {
        title: 'ПВХ REHAU 3 200 мм — высокая рама',
        price: '3 500',
        desc: 'REHAU Grazio 82 мм, армирование 3 мм С345, высота до 3 200 мм. Компенсационный зазор 15 мм сверху. Индивидуальное производство по замеру.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Plastikovoe_okno_a67ec4ad8e.jpg?updatedAt=2026-06-18T21%3A49%3A13.314Z',
        badge: 'Высокая рама',
      },
      {
        title: 'Сталинка под ключ',
        price: '6 500',
        desc: 'Обследование + усиление швеллером + ПВХ REHAU высокая рама + утепление + евровагонка. Соблюдение декора. Монтаж 3–4 дня.',
        img: CARD_IMG_D,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Обследование плиты',
        title: 'Зондирование и замер карбонизации бетона',
        desc: 'Зондирование в 3–5 точках: глубина карбонизации по индикатору фенолфталеина. Простукивание всей поверхности. Визуальный осмотр арматуры в сколах. Если потеря несущей >30% — усиление.',
        features: [
          'Карбонизация: индикатор фенолфталеина, 3–5 точек',
          'Простукивание: расслоение бетона слышно по звуку',
          'Заключение — входит в стоимость при заказе',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Усиление швеллером С245',
        title: 'Швеллер 14У + уголок 80×80×8 мм',
        desc: 'Швеллер 14У (ГОСТ 8240-97) под плиту поперёк консоли шаг 600–800 мм. Hilti HIT-RE ∅16 мм в стену на 200 мм. Несущая способность 2,4 кН — запас ×3.',
        features: [
          'Швеллер 14У С245 — ГОСТ 8240-97, h=140 мм',
          'Hilti HIT-RE ∅16 мм, глубина 200 мм — 15 кН вырывание',
          'Уголок 80×80×8 мм в угловых зонах трещин',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Рама 3 200 мм',
        title: 'ПВХ высотой 3 200 мм: армирование 3 мм',
        desc: 'REHAU Grazio 82 мм с армированием С345 3 мм. Расширение рамы 3 200 мм при ΔT=60°C — 13,4 мм. Компенсационный зазор 15 мм + ПСУЛ сверху. Нижний профиль под контур балясин.',
        features: [
          'Армирование С345 3 мм — прогиб в норме',
          'Зазор 15 мм + ПСУЛ — компенсация 13,4 мм расширения',
          'Нижний профиль по контуру декора — без сноса лепнины',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'osteklenie-v-kottedzhe': {
    slug: 'osteklenie-v-kottedzhe',
    name: 'Остекление балконов и веранд в коттедже в Омске',
    seoDescription:
      'Остекление балконов, веранд и беседок в коттеджах Омска и области: энергосберегающий стеклопакет 4-16Ar-4-16Ar-4 с i-стеклом, Rf=1,4 м²·К/Вт, ламинация профиля под дерево. Монтаж, гарантия 5 лет!',
    heroBadge: '🏡 Коттедж в Омске — ламинация под дерево, стеклопакет 4-16Ar-4-16Ar-4',
    heroTitle: 'Остекление балконов и террас в Омске',
    heroTitleHighlight: 'для коттеджей и частных домов',
    heroDesc:
      'Остекляем балконы, веранды и террасы в коттеджах — панорамные и тёплые решения для круглогодичного использования. Проектирование и монтаж одной бригадой. Бесплатный замер, завод на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('osteklenie-v-kottedzhe', 'cottage'),
    topCard1Title: 'Остекление веранды коттеджа 6 м',
    topCard1Subtitle: 'ПВХ ламинация под дерево + стеклопакет 4-16Ar + монтаж',
    topCard1Price: 'от 90 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На профиль, стеклопакет, фурнитуру и монтаж',
    aboutBadge: 'Пригороды Омска — работаем выездом',
    aboutTitle: 'Остекление коттеджа: энергоэффективность и эстетика природного дерева',
    aboutImage: CARD_IMG_D,
    seoText: `Загородный дом в Омской области — иная теплотехническая задача, чем городская квартира. В частном доме нет общих стен с соседями, нет отапливаемых подъездов, нет тепла от центральной системы отопления через плиты перекрытия. Наружные стены и кровля отдают тепло непосредственно в атмосферу при −40°C. Теплопотери через остекление — основной канал утечки энергии: удельный поток тепла через однокамерный стеклопакет 6 мм — 17 Вт/м² при ΔT=60°C. Через стеклопакет 4-16Ar-4-16Ar-4 с i-стеклом — 3,1 Вт/м² при том же перепаде. Снижение теплопотерь в 5,5 раза для веранды 6×3 м (площадь остекления ~18 м²): экономия 252 Вт постоянно — около 110 кВт·ч в месяц в пик морозов, или 385 руб/месяц при тарифе 3,5 руб/кВт·ч. За 10 лет — 46 000 руб только на отоплении веранды.

Стеклопакет 4-16Ar-4-16Ar-4 для коттеджа: две воздушные камеры шириной по 16 мм (заполнение аргоном), два листа стекла 4 мм по краям и один 4 мм в середине. Низкоэмиссионное (i-стекло) покрытие на внутреннем листе: εн=0,04 против εн=0,84 у обычного стекла. Это означает, что i-стекло отражает длинноволновое ИК-излучение от отопительных приборов обратно в помещение — вместо того чтобы пропускать его наружу. Коэффициент теплопередачи стеклопакета 4-16Ar-4-16Ar-4 с i-стеклом: Ug = 1,1 Вт/м²·К. Для сравнения: однокамерный стеклопакет 4-16-4 без i-стекла: Ug = 2,8 Вт/м²·К. Для суммарного окна с рамой REHAU 82 мм: Uw = 1,35 Вт/м²·К — соответствует пассивному дому по стандарту.

Эстетика для коттеджа: ламинация профиля под натуральное дерево. REHAU предлагает декоры «Золотой дуб», «Тёмный дуб», «Антрацит», «Ирландский дуб» (каталог Deco+Evo: 24 декора). Ламинационная плёнка CPL толщиной 0,4 мм наносится под давлением при 180°C — адгезия 4 Н/мм, устойчивость к UV по Q-Tec тесту 5 000 часов (это 4–5 лет прямого омского солнца). Планомерное обновление ламинации — перекраска специальной эмалью REHAU RAL без снятия рамы — раз в 12–15 лет. Алюминиевый профиль для открытых веранд-террас: декоративное анодирование 20 мкм или порошковая окраска RAL 180 мкм — ультрафиолет и механика не трогают в течение 25 лет.

Монтаж на загородном объекте в Омской области имеет особенность: удалённость от склада. Выезд на замер — бесплатно в радиусе 50 км от Омска (Ачаирский, Дружино, Усть-Заостровка, Красноярка, Троицкое). Свыше 50 км — доплата 3 руб/км. Производство конструкций по результатам замера — 5–10 рабочих дней. Доставка и монтаж — один день для объектов до 8 позиций (окна + двери + ворота). Сложные объекты (верандное остекление 20+ м²) — 2 дня. Все расходные материалы (пена, силикон, дюбели, ПСУЛ) доставляются с бригадой — ничего докупать не нужно.`,
    glazingCard: [
      {
        title: 'Стеклопакет 4-16Ar-4-16Ar-4 + i-стекло',
        price: '4 500',
        desc: 'Двухкамерный 16 мм аргон + i-стекло. Ug=1,1 Вт/м²·К. Теплопотери в 5,5 раза ниже однокамерного. REHAU Grazio 82 мм.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Plastikovoe_okno_a67ec4ad8e.jpg?updatedAt=2026-06-18T21%3A49%3A13.314Z',
        badge: 'Энергосбережение',
      },
      {
        title: 'ПВХ ламинация под дерево',
        price: '5 200',
        desc: 'REHAU Grazio декор «Золотой дуб» / «Тёмный дуб» + двухкамерный стеклопакет. CPL плёнка 0,4 мм UV 5 000 ч. Для коттеджей и загородных домов.',
        img: CARD_IMG_D,
        badge: 'Под дерево',
      },
      {
        title: 'Алюминий Reynaers (верандное)',
        price: '6 800',
        desc: 'Алюминий с терморазрывом Reynaers CS 77 + i-стекло. Uw=1,2 Вт/м²·К. Анодирование 20 мкм — 25 лет без обслуживания. Для открытых веранд.',
        img: CARD_IMG_B,
        badge: 'Верандный формат',
      },
      {
        title: 'Остекление коттеджа под ключ',
        price: '9 800',
        desc: 'Замер + производство + монтаж + утепление + отделка. Остекление веранды, балкона, беседки за 1–2 дня. Выезд до 50 км от Омска бесплатно.',
        img: CARD_IMG_C,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Стеклопакет 4-16Ar',
        title: 'Расчёт теплопотерь: экономия 46 000 руб за 10 лет',
        desc: 'Поток тепла: 4-16Ar-4-16Ar-4 с i-стеклом — 3,1 Вт/м². Однокамерный 6 мм — 17 Вт/м². Веранда 18 м² при ΔT=60°C: экономия 252 Вт = 110 кВт·ч/месяц = 385 руб/месяц.',
        features: [
          'Ug = 1,1 Вт/м²·К vs 2,8 Вт/м²·К однокамерного',
          'Экономия 385 руб/месяц — окупаемость 3–4 года',
          'i-стекло: εн=0,04 — отражает ИК обратно в дом',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Ламинация под дерево',
        title: 'CPL 0,4 мм: 5 000 часов UV без выцветания',
        desc: 'REHAU Deco+Evo: 24 декора (дуб, антрацит, ирландский дуб). CPL 0,4 мм на ПУ-клее при 180°C. Q-Tec тест 5 000 ч UV = 4–5 лет прямого омского солнца.',
        features: [
          '24 декора по каталогу REHAU Deco+Evo',
          'CPL 0,4 мм: адгезия 4 Н/мм, UV 5 000 ч',
          'Обновление эмалью RAL без снятия рам раз в 12–15 лет',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Выезд в Омскую область',
        title: 'Замер до 50 км от Омска — бесплатно',
        desc: 'Ачаирский, Дружино, Усть-Заостровка, Красноярка, Троицкое — в зоне бесплатного выезда. Свыше 50 км: 3 руб/км. Производство 5–10 дней. Монтаж за 1 день.',
        features: [
          'Бесплатный выезд до 50 км от Омска',
          'Производство по замеру 5–10 рабочих дней',
          'Монтаж за 1 день объекты до 8 позиций',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'balkonnye-bloki': {
    slug: 'balkonnye-bloki',
    name: 'Балконные блоки ПВХ в Омске — дверь и окно',
    seoDescription:
      'Балконный блок ПВХ в Омске: дверь 700×2 100 мм + боковое окно 800×1 400 мм, профиль REHAU/VEKA 5-камерный, двойной EPDM, двухкамерный стеклопакет. Монтаж за 1 день. Гарантия 5 лет!',
    heroBadge: '🚪 Балконный блок — дверь + окно в едином профиле и цвете',
    heroTitle: 'Балконные блоки в Омске',
    heroTitleHighlight: 'дверь и окно в едином стиле',
    heroDesc:
      'Изготавливаем и монтируем балконные блоки: дверь на лоджию и боковое окно в комнату — единый дизайн, надёжная фурнитура, установка за один день. Бесплатный замер, производство на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('balkonnye-bloki', 'production'),
    topCard1Title: 'Балконный блок ПВХ стандартный',
    topCard1Subtitle: 'Дверь 700×2 100 мм + окно 800×1 400 мм + монтаж',
    topCard1Price: 'от 24 500 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На профиль, стеклопакет, фурнитуру и монтаж',
    aboutBadge: 'Единая система — никакого шва между дверью и окном',
    aboutTitle: 'Балконный блок: единый профиль, единый монтажный шов',
    aboutImage: 'https://balkonreshenie.ru/uploads/thumbnail_Plastikovoe_okno_a67ec4ad8e.jpg?updatedAt=2026-06-18T21%3A49%3A13.314Z',
    seoText: `Балконный блок — конструктив, объединяющий выходную дверь на лоджию и боковое окно в комнату в единую раму. Типовой размер для омских панельных домов: дверной проём 700×2 100 мм, оконный проём 800×1 400 мм, импост (вертикальный соединитель) шириной 60 мм. Суммарная ширина блока 1 560 мм — точно под типовой проём панельных домов серии П-44. Серии 1-464 и 1-447 требуют нестандартных размеров: двери 650×2 050 мм или 720×2 200 мм. Мы производим любой нестандарт на своём заводе без наценки за нетипоразмер — если размер не выходит за технологические пределы профильной системы.

Импост в балконном блоке испытывает поперечную нагрузку от двери при её открывании. Масса дверного полотна со стеклопакетом — 28–35 кг. При открытой на 90° двери момент нагрузки на импост от двери на петлях 2100 мм: M = F·L = 350·1 050 = 367 500 Н·мм. Сопротивление ПВХ-импоста 82 мм с армированием 2,5 мм изгибу: Mx = σ·W = 240·1 100 = 264 000 Н·мм — недостаточно для нагрузки от двери! Поэтому в балконных блоках импост всегда армируется отдельным вкладышем из стали 3 мм С345: Mx возрастает до 624 000 Н·мм — запас ×1,7 к нагрузке от двери.

Петли для балконной двери — не оконные петли-ножницы: они рассчитаны на разные нагрузки. Дверные петли типа MACO MULTI MATIC или Siegenia TITAN AF рассчитаны на нагрузку 100–120 кг и угол открывания 90° с удержанием. Количество петель на дверь высотой 2 100 мм: 3 петли (верхняя, средняя, нижняя). Шаг крепления каждой петли к профилю: 4 самореза 5×35 мм в армирующую сталь (не в пластик). Суммарная нагрузка на одну петлю — 35/3 = 11,7 кг при запасе петли 100 кг — коэффициент ×8,5. Регулировка петель: 3D-регулировка по всем трём осям с шагом 1 мм.

Монтажный шов балконного блока сложнее, чем у обычного окна: шов длиннее (суммарный периметр до 8,5 пм), зоны углов дверного и оконного проёмов разные по конфигурации, и снизу блока — порог. Нижний порог — слабое место: через него уходит тепло и проникает вода при таянии снега на балконе. Применяем порог с терморазрывом REHAU: алюминиевый наружный порог + полиамидная перемычка-терморазрыв + ПВХ-профиль изнутри. Под порогом — демпфирующая EPDM-прокладка 8 мм, компенсирующая неровности пола. Шов под порогом: монтажная пена + гидроизоляция Stizo Flex снаружи.`,
    glazingCard: [
      {
        title: 'Блок стандарт REHAU Grazio 82 мм',
        price: '24 500',
        desc: 'Дверь 700×2 100 мм + окно 800×1 400 мм. REHAU 82 мм + двойной EPDM + двухкамерный стеклопакет i-стекло. Класс A4. Монтаж 1 день.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Plastikovoe_okno_a67ec4ad8e.jpg?updatedAt=2026-06-18T21%3A49%3A13.314Z',
        badge: 'Стандарт',
      },
      {
        title: 'Блок нестандарт (любые размеры)',
        price: '28 000',
        desc: 'Производство по точным замерам: дверь до 900×2 300 мм + окно. Армирование импоста 3 мм С345. Подходит для хрущёвок и сталинок с нестандартными проёмами.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Plastikovoe_okno_a67ec4ad8e.jpg?updatedAt=2026-06-18T21%3A49%3A13.314Z',
        badge: 'Нестандарт',
      },
      {
        title: 'Блок с ламинацией RAL',
        price: '31 000',
        desc: 'Блок в цвете RAL по запросу (200+ цветов) — для новостроек с требованием к единому фасаду. CPL плёнка 0,4 мм, UV-защита 5 000 ч.',
        img: CARD_IMG_D,
        badge: 'Цветной',
      },
      {
        title: 'Блок + откосы + подоконник',
        price: '34 000',
        desc: 'Балконный блок + ПВХ-откосы с Пеноплэксом 20 мм + подоконник ПВХ 500 мм + наружный отлив. Полный комплект монтажа за 1 день.',
        img: CARD_IMG_C,
        badge: 'С отделкой',
      },
    ],
    StructureTab: [
      {
        tabName: 'Армирование импоста',
        title: 'Импост с армированием 3 мм С345 — обязателен',
        desc: 'Момент от двери 35 кг на импосте 2 100 мм: 367 500 Н·мм. Импост ПВХ без армирования: Mx=264 000 Н·мм — недостаточно. С армированием 3 мм С345: Mx=624 000 Н·мм — запас ×1,7.',
        features: [
          'Момент нагрузки от двери 35 кг — 367 500 Н·мм',
          'Армирование 3 мм С345 — Mx=624 000 Н·мм',
          'Запас прочности импоста ×1,7 к нагрузке двери',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Петли 3D — нагрузка ×8,5',
        title: 'MACO MULTI MATIC — 100 кг, 3D-регулировка',
        desc: 'Три петли на дверь 2 100 мм. Нагрузка 11,7 кг/петля при ресурсе 100 кг — запас ×8,5. 3D-регулировка ±1 мм. Саморезы 5×35 мм в армирующую сталь, не в пластик.',
        features: [
          'Три петли MACO MULTI MATIC на дверь 2 100 мм',
          'Нагрузка 11,7 кг — запас ×8,5 к ресурсу 100 кг',
          '3D-регулировка ±1 мм по всем осям',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Порог с терморазрывом',
        title: 'Порог REHAU с полиамидной перемычкой',
        desc: 'Наружный алюминий + полиамид (терморазрыв) + ПВХ изнутри. EPDM-прокладка 8 мм под порог. Stizo Flex снаружи под порогом. Тепловой мост в зоне порога ликвидирован.',
        features: [
          'Полиамид терморазрыв — мостик холода исключён',
          'EPDM 8 мм компенсирует неровности пола',
          'Stizo Flex снаружи — гидроизоляция под порогом',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  'okna-plastikovye': {
    slug: 'okna-plastikovye',
    name: 'Пластиковые окна в Омске от завода — REHAU и VEKA',
    seoDescription:
      'Пластиковые окна REHAU и VEKA в Омске от завода-производителя: 5-камерный профиль 82 мм, двухкамерный стеклопакет 4-14Ar-4-14Ar-4 с i-стеклом, двойной EPDM, класс A4. Монтаж за 1 день. Гарантия 5 лет!',
    heroBadge: '🪟 REHAU и VEKA — напрямую с завода, без наценки посредника',
    heroTitle: 'Пластиковые окна в Омске',
    heroTitleHighlight: 'напрямую от производителя',
    heroDesc:
      'Изготавливаем пластиковые окна для комнат, кухонь и лоджий на собственном заводе — без посредников и переплат. Энергосберегающие стеклопакеты, аккуратный монтаж. Бесплатный замер, ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('okna-plastikovye', 'production'),
    topCard1Title: 'Окно ПВХ 1 400×1 400 мм',
    topCard1Subtitle: 'REHAU Grazio + i-стекло + аргон + монтаж',
    topCard1Price: 'от 8 500 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На профиль, стеклопакет, фурнитуру и монтажный шов',
    aboutBadge: 'Собственный завод в Омске — без посредников',
    aboutTitle: 'Пластиковые окна: почему собственное производство важно',
    aboutImage: 'https://balkonreshenie.ru/uploads/thumbnail_Plastikovoe_okno_a67ec4ad8e.jpg?updatedAt=2026-06-18T21%3A49%3A13.314Z',
    seoText: `Рынок пластиковых окон в Омске насчитывает более 200 компаний, из которых собственное производство (экструзия, нарезка, сварка профиля) имеют не более 15. Остальные — посредники: закупают готовый профиль в Москве или Екатеринбурге, нарезают в небольших цехах. Разница для покупателя: посредник добавляет 20–35% к стоимости материала. Наш завод по ул. Гусарова, 26 производит полный цикл: от нарезки профиля на угловой пиле Pertici до сварки на четырёхголовочном сварочном станке Sturtz и декоративной обработки на центре Elumatec. Партия от 5 изделий — производится за 3–5 рабочих дней, не через «мы отправим заявку на завод в Москву».

Профильная система REHAU Grazio 82 мм: 5 камер, глубина профиля 82 мм, термическое сопротивление Rf = 1,06 м²·К/Вт. Система разработана под климат с температурами до −50°C: испытания в климатической камере при −48°C в течение 1 000 часов без деформации створки и рамы — данные из технической документации REHAU. Двухконтурное уплотнение EPDM по периметру рамы и по периметру створки: класс воздухопроницаемости A4 по ГОСТ 23166 (≤0,01 м³/ч·м при 100 Па), класс водонепроницаемости E750 (выдерживает давление воды 750 Па = эквивалент ливня 150 мм/ч при горизонтальном ветре 20 м/с).

Стеклопакет 4-14Ar-4-14Ar-4 с i-стеклом: три листа стекла 4 мм, воздушные камеры 14 мм заполнены аргоном (теплопроводность аргона λ=0,017 Вт/м·К, воздуха λ=0,026 Вт/м·К — аргон на 35% хуже проводит тепло). i-стекло (низкоэмиссионное покрытие серебра SnO₂+Ag) на внутреннем листе снижает излучательную способность поверхности с ε=0,84 до ε=0,04 — тепло не уходит через стекло наружу «излучением». Коэффициент теплопередачи такого стеклопакета Ug = 1,1 Вт/м²·К. В сочетании с рамой REHAU 82 мм: Uw = 1,35 Вт/м²·К для окна 1 400×1 400 мм. Требование СП 50.13330 для Омска — Uw ≤ 0,76 Вт/м²·К для жилых домов. Наше окно перекрывает этот норматив с запасом в 1,8 раза.

Монтажный шов по ГОСТ 30971-2012 разделён на три слоя с чёткими функциями. Наружный слой: ПСУЛ (предварительно сжатая уплотнительная лента), паропроницаемость Sd ≤ 0,5 м — влага изнутри шва уходит наружу. Средний слой: монтажная пена Soudal Pro 25 Plus, заполнение 60–70% объёма шва (не более — иначе пена разрывает профиль при расширении). Внутренний слой: пароизоляционная лента ИЛЬБРУК 600, Sd ≥ 13 м — блокирует проникновение пара из квартиры в шов. Суммарный R монтажного шва — 0,9 м²·К/Вт. Нарушение любого из трёх слоёв сокращает ресурс шва с 20 до 3–5 лет — это причина 90% рекламаций «продувает» и «текут откосы».`,
    glazingCard: [
      {
        title: 'Окно ПВХ REHAU Grazio 82 мм',
        price: '8 500',
        desc: 'REHAU Grazio 5-кам. 82 мм + двухкамерный 4-14Ar-4-14Ar-4 + i-стекло + MACO фурнитура. Класс A4, E750. Монтаж за 4–6 часов.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Plastikovoe_okno_a67ec4ad8e.jpg?updatedAt=2026-06-18T21%3A49%3A13.314Z',
        badge: 'Хит продаж',
      },
      {
        title: 'Окно ПВХ VEKA Softline 82 мм',
        price: '8 200',
        desc: 'VEKA Softline 5-кам. 82 мм + двухкамерный стеклопакет + i-стекло + Siegenia фурнитура. Ресурс фурнитуры 200 000 циклов. Монтаж за 1 день.',
        img: 'https://balkonreshenie.ru/uploads/thumbnail_Plastikovoe_okno_a67ec4ad8e.jpg?updatedAt=2026-06-18T21%3A49%3A13.314Z',
        badge: 'VEKA',
      },
      {
        title: 'Окно ПВХ с ламинацией RAL',
        price: '11 500',
        desc: 'REHAU или VEKA в цвете RAL (для фасадов ЖК). CPL плёнка 0,4 мм. Двухкамерный стеклопакет. Воздухопроницаемость A4.',
        img: CARD_IMG_D,
        badge: 'Цветное',
      },
      {
        title: 'Окно + откосы + подоконник',
        price: '12 500',
        desc: 'REHAU/VEKA + ПВХ-откосы с Пеноплэксом 20 мм + подоконник 400 мм + наружный отлив. Полная установка под ключ без мостиков холода.',
        img: CARD_IMG_C,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'REHAU Grazio 82 мм',
        title: '5 камер, Rf=1,06 м²·К/Вт, испытано при −48°C',
        desc: 'Глубина 82 мм, 5 камер. Rf=1,06 м²·К/Вт. Испытания −48°C × 1 000 ч — без деформации. Двойной EPDM: A4 ≤0,01 м³/ч·м и E750 (ливень 150 мм/ч + ветер 20 м/с).',
        features: [
          'Rf=1,06 м²·К/Вт — в 1,7× выше 3-камерного',
          'Испытания при −48°C 1 000 ч — для Омска с запасом',
          'Класс A4 E750 — наивысший стандарт герметичности',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Стеклопакет i-стекло + аргон',
        title: 'Ug=1,1 Вт/м²·К — СП 50.13330 перекрыт в 1,8×',
        desc: 'i-стекло ε=0,04 + аргон λ=0,017 Вт/м·К. Ug=1,1, Uw=1,35 для окна 1 400×1 400 мм. Норматив СП 50 для Омска Uw≤0,76 — перекрыт в 1,8×.',
        features: [
          'i-стекло: εн=0,04 — 97% ИК отражается обратно',
          'Аргон: теплопроводность 0,017 vs воздух 0,026 Вт/м·К',
          'Uw=1,35 — норматив СП 50 для Омска перекрыт в 1,8×',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Монтаж по ГОСТ 30971',
        title: 'Три слоя монтажного шва — ресурс 20+ лет',
        desc: 'ПСУЛ Sd≤0,5 м снаружи + пена Soudal 60–70% средний + ИЛЬБРУК 600 Sd≥13 м изнутри. Суммарный R=0,9 м²·К/Вт. Нарушение одного слоя = ресурс 3–5 лет вместо 20+.',
        features: [
          'ПСУЛ: паропроницаемость Sd≤0,5 м — влага выходит',
          'Пена 60–70%: не разрывает профиль при расширении',
          'ИЛЬБРУК 600 Sd≥13 м — пар из квартиры в шов не идёт',
        ],
        img: TAB_IMG_C,
      },
    ],
  },

  's-vynosom-po-polu': {
    slug: 's-vynosom-po-polu',
    name: 'Остекление балкона с выносом по полу в Омске',
    seoDescription:
      'Остекление балкона с выносом по полу в Омске: металлокаркас из профтрубы 80×60×3 мм на консолях, укосины в капитальную стену 150 мм, сварка ГОСТ 14771-76, профнастил Н-60 + стяжка М150. Гарантия 5 лет!',
    heroBadge: '📐 Вынос по полу — консоли 80×60×3 мм и укосины в капитальную стену',
    heroTitle: 'Остекление с выносом по полу в Омске',
    heroTitleHighlight: 'больше площади на балконе',
    heroDesc:
      'Расширяем балкон наружу по линии пола — появляется реальное дополнительное пространство для отдыха и хранения. Перед монтажом усиливаем основание. Бесплатный выезд замерщика, завод на ул. Гусарова, гарантия 5 лет.',
    heroBackground: getDeterministicImage('s-vynosom-po-polu', 'exteriors'),
    topCard1Title: 'Вынос по полу 40 см, лоджия 3 м',
    topCard1Subtitle: 'Металлокаркас + укосины + профнастил + стяжка + ПВХ',
    topCard1Price: 'от 58 000 руб',
    topCard2Title: 'Гарантия 5 лет',
    topCard2Desc: 'На каркас, сварку, покраску, профнастил и стяжку',
    aboutBadge: 'Капитальный вынос — не просто кронштейны',
    aboutTitle: 'Вынос по полу: опорные укосины и расчёт на опрокидывание',
    aboutImage: DEFAULT_ABOUT_IMG,
    seoText: `Вынос по полу — технически самая нагруженная конструкция из всего спектра балконных работ. Суть: металлокаркас выносится за фасад здания на 30–60 см, создавая расширенную плоскость пола. Нагрузки на этот кронштейнный каркас принципиально иные, чем при стандартном монтаже рамы: возникает опрокидывающий момент от собственного веса конструкции и полезной нагрузки. Рассмотрим на цифрах: вынос 40 см, лоджия 3 м, масса профнастила + стяжки 50 мм = 180 кг, полезная нагрузка (люди, вещи) = 300 кг. Суммарная нагрузка 480 кг на плече 400 мм создаёт опрокидывающий момент М = 480·400 = 192 000 кг·мм = 1 882 кН·мм относительно линии стыка кронштейна со стеной. Без укосин весь этот момент воспринимают только горизонтальные анкеры — они работают на вырывание.

Именно поэтому ключевой элемент конструкции — опорные укосины. Укосина — это диагональный элемент из профтрубы 80×60×3 мм, идущий от нижней полки консоли вверх-назад к капитальной стене здания под углом 45°. Укосина работает на сжатие (не на вырывание), воспринимает до 70% опрокидывающего момента. Анкерование укосины в капитальную стену: химические анкеры Hilti HIT-RE 500 V4 ∅16 мм, глубина 150 мм, усилие вырывания 28 кН. Расчётная нагрузка на укосину при М=1 882 кН·мм: N = M/(sin45°·L_укосины) = 1 882/(0,707·600) = 4,44 кН. Запас прочности: 28/4,44 = 6,3 — соответствует ГОСТ 27751 (требуемый минимум 1,4 для строительных конструкций).

Горизонтальные консоли из профтрубы 80×60×3 мм крепятся к несущей стене здания горизонтальными анкерами Hilti ∅16 мм на глубину 150 мм, шаг консолей 600 мм по длине лоджии 3 м (итого 5–6 консолей). Поверх консолей укладывается профнастил Н-60 (высота гофры 60 мм, стальной лист 0,7 мм оцинкованный, несущая способность при пролёте 600 мм — 400 кг/м²). Профнастил приваривается к консолям прерывистым швом: катет 3 мм, длина шва 50 мм, шаг 150 мм. Поверх профнастила — стяжка М150 толщиной 50 мм с армированием сеткой 100×100×3 мм: сетка компенсирует растрескивание стяжки при температурных деформациях.

Антикоррозионная защита каркаса выноса по полу — особенно важна в нижней зоне, где конструкция контактирует с влагой, снегом и талой водой. Применяем двухкомпонентную систему: грунт эпоксидный TIKKURILA Temaprime ЕЕ (100 мкм) + эмаль полиуретановая TIKKURILA Temacoat RM 40 (120 мкм). Суммарная толщина 220 мкм. Эпоксидный грунт обеспечивает адгезию к металлу 7,5 МПа и катодную защиту в зоне повреждений. Полиуретановая эмаль — химическая стойкость и UV-защита. Ресурс системы в условиях Омска (влажность 72%, температура −40°C/+35°C) — не менее 15 лет без ревизии и перекраски.`,
    glazingCard: [
      {
        title: 'Металлокаркас вынос 30 см',
        price: '7 500',
        desc: 'Консоли 80×60×3 мм шаг 600 мм + укосины 45° в стену + Hilti ∅16 мм 150 мм. Грунт эпоксидный 100 мкм + эмаль ПУ 120 мкм. Для вынос 30 см.',
        img: CARD_IMG_C,
        badge: 'Вынос 30 см',
      },
      {
        title: 'Металлокаркас вынос 40–60 см',
        price: '9 800',
        desc: 'Усиленные консоли 80×60×3 мм + обязательные укосины 45° + Hilti ∅16 мм. Профнастил Н-60 0,7 мм + стяжка М150 50 мм + сетка 100×100×3 мм.',
        img: CARD_IMG_C,
        badge: 'Вынос 40–60 см',
      },
      {
        title: 'Каркас + остекление ПВХ REHAU',
        price: '13 500',
        desc: 'Металлокаркас вынос 40 см + профнастил + стяжка + ПВХ REHAU Grazio 82 мм. Прибавка 1,2 м² для лоджии 3 м. Согласование с УК в комплекте.',
        img: CARD_IMG_A,
        badge: 'С остеклением',
      },
      {
        title: 'Вынос по полу под ключ',
        price: '18 000',
        desc: 'Каркас + профнастил + стяжка + ПВХ REHAU + утепление «термос» + ПВХ-отделка + ламинат + электрика. Готовая расширенная лоджия за 4–6 дней.',
        img: CARD_IMG_D,
        badge: 'Под ключ',
      },
    ],
    StructureTab: [
      {
        tabName: 'Укосины в стену 150 мм',
        title: 'Укосины 45° — ключевой элемент против опрокидывания',
        desc: 'Момент опрокидывания 1 882 кН·мм. Укосина 45° воспринимает 70% момента сжатием. Hilti ∅16 мм 150 мм — 28 кН вырывания. Нагрузка на укосину 4,44 кН — запас ×6,3 (норма ГОСТ 27751 ×1,4).',
        features: [
          'Укосины 45° — 70% момента идёт на сжатие, не вырывание',
          'Hilti ∅16 мм 150 мм — 28 кН при нагрузке 4,44 кН',
          'Запас прочности ×6,3 — норма ГОСТ 27751 ×1,4',
        ],
        img: TAB_IMG_A,
      },
      {
        tabName: 'Профнастил Н-60 + стяжка',
        title: 'Профнастил Н-60 0,7 мм — несущая 400 кг/м²',
        desc: 'Профнастил Н-60 гофра 60 мм, сталь 0,7 мм оцинкованная. Несущая способность при пролёте 600 мм — 400 кг/м². Сварка к консолям катет 3 мм. Стяжка М150 50 мм + сетка 100×100×3 мм.',
        features: [
          'Н-60: несущая 400 кг/м² при пролёте 600 мм',
          'Сварка к консолям: шов 50 мм шаг 150 мм',
          'Сетка 100×100×3 мм: компенсация температурного растрескивания',
        ],
        img: TAB_IMG_B,
      },
      {
        tabName: 'Антикоррозионная защита',
        title: 'Эпоксидный грунт + ПУ эмаль — 15 лет без перекраски',
        desc: 'Грунт TIKKURILA Temaprime ЕЕ 100 мкм + эмаль Temacoat RM 40 120 мкм = 220 мкм суммарно. Адгезия 7,5 МПа. Ресурс 15 лет при влажности 72% и −40°C в Омске.',
        features: [
          'Эпоксидный грунт 100 мкм — адгезия 7,5 МПа',
          'ПУ эмаль 120 мкм — UV-стойкость и химзащита',
          'Суммарно 220 мкм — ресурс 15 лет без ревизии',
        ],
        img: TAB_IMG_C,
      },
    ],
  },
};

const SERVICE_FALLBACKS: Record<string, ServiceFallback> = {
  ...Object.fromEntries(EXTRA_SERVICE_SEEDS.map((seed) => [seed.slug, seedToFallback(seed)])),
  ...HAND_CRAFTED_SERVICE_FALLBACKS,
};

/** Все slug услуг — для sitemap и маршрутизации */
export const SERVICE_SLUGS = Object.keys(SERVICE_FALLBACKS);

// =========================================================================
// ЗАПРОСЫ К STRAPI v5
// =========================================================================

async function getService(slug: string) {
  try {
    const res = await fetch(
      `${STRAPI_BASE}/api/services?filters[slug][$eq]=${slug}&populate=*`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[0] || null;
  } catch (error) {
    console.error(`🚨 Ошибка загрузки услуги [${slug}] из Strapi:`, error);
    return null;
  }
}

async function getArticlesData() {
  try {
    const url = `${STRAPI_BASE}/api/articles?populate[0]=cover&sort[0]=publishedAt:desc`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error('🚨 Ошибка загрузки статей для страницы услуги:', error);
    return null;
  }
}

async function getMainPageData() {
  try {
    const url =
      `${STRAPI_BASE}/api/main-page?populate[0]=heroBackground&populate[1]=aboutImage&populate[2]=glazingCard.img&populate[3]=StructureTab.img`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error('🚨 Ошибка загрузки главной страницы для склейки услуги:', error);
    return null;
  }
}

// =========================================================================
// ХЕЛПЕРЫ: ИМЯ УСЛУГИ, СКЛЕЙКА ДАННЫХ
// =========================================================================

function resolveServiceName(slug: string, strapiData: Record<string, unknown> | null, fallback: ServiceFallback | undefined): string {
  if (strapiData) {
    const raw = strapiData.title || strapiData.name;
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
  }
  return fallback?.name || slug;
}

function resolveSeoDescription(
  slug: string,
  strapiData: Record<string, unknown> | null,
  fallback: ServiceFallback | undefined
): string {
  if (strapiData) {
    const raw = strapiData.seoDescription || strapiData.description || strapiData.seo_description;
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
  }
  return fallback?.seoDescription || `Профессиональные услуги по остеклению и отделке балконов в Омске. Заводские цены, гарантия 5 лет. Бесплатный замер!`;
}

function buildMergedData(
  slug: string,
  strapiRaw: Record<string, unknown> | null,
  fallback: ServiceFallback | undefined,
  mainData: Record<string, unknown> | null
): Record<string, unknown> {
  const s = strapiRaw || {};
  const fb = fallback;

  const glazingFromStrapi = s.glazingCard as GlazingCard[] | undefined;
  const tabsFromStrapi = s.StructureTab as StructureTab[] | undefined;

  return {
    ...mainData,
    heroBadge: s.heroBadge || fb?.heroBadge || mainData?.heroBadge,
    heroTitle: s.heroTitle || fb?.heroTitle || mainData?.heroTitle,
    heroTitleHighlight: s.heroTitleHighlight || fb?.heroTitleHighlight || 'в Омске',
    heroDesc: s.heroDesc || fb?.heroDesc || mainData?.heroDesc,
    // Локальный пул картинок в ПРИОРИТЕТЕ: fb?.heroBackground уже содержит getDeterministicImage().
    // s.heroBackground (Strapi) намеренно игнорируется для сохранения SEO-консистентности пула.
    heroBackground: fb?.heroBackground || mainData?.heroBackground,
    topCard1Title: s.topCard1Title || fb?.topCard1Title || mainData?.topCard1Title,
    topCard1Subtitle: s.topCard1Subtitle || fb?.topCard1Subtitle || mainData?.topCard1Subtitle,
    topCard1Price: s.topCard1Price || fb?.topCard1Price || mainData?.topCard1Price,
    topCard2Title: s.topCard2Title || fb?.topCard2Title || mainData?.topCard2Title,
    topCard2Desc: s.topCard2Desc || fb?.topCard2Desc || mainData?.topCard2Desc,
    aboutBadge: s.aboutBadge || fb?.aboutBadge || mainData?.aboutBadge,
    aboutTitle: s.aboutTitle || fb?.aboutTitle || mainData?.aboutTitle,
    aboutImage: s.aboutImage || fb?.aboutImage || mainData?.aboutImage,
    glazingCard:
      glazingFromStrapi && glazingFromStrapi.length > 0
        ? glazingFromStrapi
        : fb?.glazingCard || mainData?.glazingCard,
    StructureTab:
      tabsFromStrapi && tabsFromStrapi.length > 0
        ? tabsFromStrapi
        : fb?.StructureTab || mainData?.StructureTab,
    seoText: s.seoText || (fb?.seoText ? textToStrapiBlocks(fb.seoText) : mainData?.seoText),
    _serviceSlug: slug,
  };
}

// =========================================================================
// METADATA (Next.js 15 — params это Promise)
// =========================================================================

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Единственная страница услуг, полностью готовая к индексации
const INDEXED_SERVICE_SLUGS = new Set(['pryamoy-balkon']);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [strapiRaw, fallback] = await Promise.all([
    getService(slug),
    Promise.resolve(SERVICE_FALLBACKS[slug]),
  ]);

  if (!strapiRaw && !fallback) {
    return { title: 'Услуга не найдена | Балконные Решения Омск' };
  }

  const strapiData = (strapiRaw?.attributes || strapiRaw) as Record<string, unknown> | null;
  const name = resolveServiceName(slug, strapiData, fallback);
  const description = resolveSeoDescription(slug, strapiData, fallback);

  const isIndexed = INDEXED_SERVICE_SLUGS.has(slug);

  return {
    title: `${name} под ключ в Омске | Цены от завода БАЛКОННЫЕ РЕШЕНИЯ`,
    description,
    alternates: {
      canonical: `https://balkonreshenie.ru/services/${slug}`,
    },
    robots: {
      index: isIndexed,
      follow: isIndexed,
    },
  };
}

// =========================================================================
// СТРАНИЦА УСЛУГИ (Server Component)
// =========================================================================

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;

  const [strapiRaw, articlesData, mainData] = await Promise.all([
    getService(slug),
    getArticlesData(),
    getMainPageData(),
  ]);

  const fallback = SERVICE_FALLBACKS[slug];

  if (!strapiRaw && !fallback) {
    notFound();
  }

  const strapiData = (strapiRaw?.attributes || strapiRaw) as Record<string, unknown> | null;
  const mergedData = buildMergedData(slug, strapiData, fallback, mainData);

  return (
    <HomeClientPage
      initialData={mergedData}
      articlesData={articlesData || []}
    />
  );
}
