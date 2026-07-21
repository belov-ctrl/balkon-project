import fs from 'fs';
import path from 'path';

const FILE = path.join('src', 'app', 'services', '[slug]', 'page.tsx');

/** Human-friendly hero copy — no GOST, steel grades, decibels, product codes, or technical specs. */
const HEROES = {
  'teploe-osteklenie-pvh': {
    heroTitle: 'Тёплое остекление балконов в Омске',
    heroTitleHighlight: 'тёплая лоджия круглый год',
    heroDesc:
      'Превращаем промёрзшую лоджию в комфортное помещение: герметичные рамы, тёплые откосы и защита от сквозняков. Монтаж за один день без лишней суеты. Бесплатный замер, производство на заводе по ул. Гусарова, гарантия 5 лет.',
  },
  'holodnoe-osteklenie-al': {
    heroTitle: 'Холодное остекление балконов в Омске',
    heroTitleHighlight: 'защита от ветра и дождя без лишней нагрузки',
    heroDesc:
      'Лёгкие алюминиевые конструкции закрывают балкон от ветра, пыли и осадков — идеально для старого фонда и последних этажей. Створки не занимают место на балконе, монтаж за один день. Бесплатный выезд замерщика, завод на ул. Гусарова, гарантия 5 лет.',
  },
  'panoramnoe-osteklenie': {
    heroTitle: 'Панорамное остекление балконов в Омске',
    heroTitleHighlight: 'максимум света и обзора',
    heroDesc:
      'Стеклянные конструкции от пола до потолка наполняют комнату светом и создают эффект просторной зоны отдыха. Перед монтажом усиливаем парапет для безопасности. Бесплатный замер, изготовление на заводе по ул. Гусарова, гарантия 5 лет.',
  },
  'osteklenie-v-hhrushchevke': {
    heroTitle: 'Остекление балконов в хрущёвках Омска',
    heroTitleHighlight: 'с учётом состояния плиты и парапета',
    heroDesc:
      'Знаем особенности типовых хрущёвок: перед монтажом бесплатно осматриваем плиту и парапет, подбираем лёгкое или тёплое остекление и при необходимости усиливаем основание. Монтаж за один день. Завод по ул. Гусарова, гарантия 5 лет.',
  },
  'obshivka-evrovagonkoy': {
    heroTitle: 'Обшивка балкона евровагонкой в Омске',
    heroTitleHighlight: 'уют натурального дерева',
    heroDesc:
      'Отделываем стены и потолок качественной хвойной вагонкой — тёплый интерьер без холодного бетона. Монтируем на обрешётку с пароизоляцией, чтобы дерево служило долго. Бесплатный замер, производство на ул. Гусарова, гарантия 5 лет.',
  },
  'krysha-na-balkon': {
    heroTitle: 'Крыша на балкон в Омске',
    heroTitleHighlight: 'защита от снега и протечек',
    heroDesc:
      'Устанавливаем крышу на балконы последнего этажа: надёжный каркас, гидроизоляция примыкания к стене и защита от снега и дождя. Конструкция не опирается на остекление. Бесплатный выезд на замер, завод на ул. Гусарова, гарантия 5 лет.',
  },
  'vnutrennyaya-otdelka': {
    heroTitle: 'Внутренняя отделка балконов в Омске',
    heroTitleHighlight: 'из холодной лоджии — уютное пространство',
    heroDesc:
      'Отделываем стены, потолок и пол: панели, вагонка, ламинат — под ваш бюджет и стиль. Скрываем трубы и проводку, делаем аккуратные откосы. Бесплатный замер, производство на ул. Гусарова, договор и гарантия 5 лет.',
  },
  'kompleksnoe-uteplenie': {
    heroTitle: 'Комплексное утепление балконов в Омске',
    heroTitleHighlight: 'тёплая лоджия даже в сибирские морозы',
    heroDesc:
      'Утепляем пол, стены и потолок многослойной системой — сквозняки уходят, на стенах не появляется конденсат. Лоджия становится комфортной зимой и летом. Бесплатный выезд замерщика, завод по ул. Гусарова, гарантия 5 лет.',
  },
  'balkony-pod-klyuch': {
    heroTitle: 'Балконы под ключ в Омске',
    heroTitleHighlight: 'один договор — готовая лоджия',
    heroDesc:
      'Делаем всё сами: остекление, утепление, отделку, электрику и мебель — без смены бригад и скрытых доплат. Фиксированная смета в договоре, сдаём готовую лоджию за несколько дней. Бесплатный замер, завод на ул. Гусарова, гарантия 5 лет.',
  },
  'pryamoy-balkon': {
    heroTitle: 'Остекление прямого балкона в Омске',
    heroTitleHighlight: 'классическая планировка — быстрый монтаж',
    heroDesc:
      'Остекляем фронтальную часть прямого балкона и закрываем боковые стены — работаем с панельными и кирпичными домами. Тёплое или холодное остекление на выбор. Бесплатный замер, производство на ул. Гусарова, гарантия 5 лет.',
  },
  'g-obraznyj-balkon': {
    heroTitle: 'Остекление Г-образного балкона в Омске',
    heroTitleHighlight: 'больше света в угловой квартире',
    heroDesc:
      'Две стеклянные секции — фронтальная и боковая — дают широкий обзор и наполняют комнату светом. Популярное решение для хрущёвок и новостроек. Бесплатный выезд на замер, завод по ул. Гусарова, гарантия 5 лет.',
  },
  'p-obraznyj-balkon': {
    heroTitle: 'Остекление П-образного балкона в Омске',
    heroTitleHighlight: 'панорамный обзор на три стороны',
    heroDesc:
      'Трёхстороннее остекление открывает вид почти на полкруга — перед монтажом проверяем состояние плиты и при необходимости усиливаем основание. Бесплатный замер, изготовление на заводе по ул. Гусарова, гарантия 5 лет.',
  },
  'erkernyj-balkon': {
    heroTitle: 'Остекление эркерного балкона в Омске',
    heroTitleHighlight: 'индивидуальный проект под вашу форму',
    heroDesc:
      'Эркер — нестандартная геометрия, поэтому делаем точный замер и изготавливаем конструкцию под каждый угол и скругление фасада. Бесплатный выезд замерщика, производство на ул. Гусарова, договор и гарантия 5 лет.',
  },
  'lodzhiya-3-metra': {
    heroTitle: 'Остекление лоджии 3 метра в Омске',
    heroTitleHighlight: 'самый популярный размер — под ключ',
    heroDesc:
      'Типовая трёхметровая лоджия в панельном доме: остекление, утепление и отделка одной бригадой. Монтаж за один рабочий день. Бесплатный замер, завод по ул. Гусарова, гарантия 5 лет.',
  },
  'lodzhiya-6-metrov': {
    heroTitle: 'Остекление лоджии 6 метров в Омске',
    heroTitleHighlight: 'длинная лоджия — больше полезной площади',
    heroDesc:
      'Длинную лоджию делим на несколько секций для удобного проветривания и эксплуатации. Подходит для кабинета, кладовой или зоны отдыха. Бесплатный замер, производство на ул. Гусарова, гарантия 5 лет.',
  },
  'vynosnoj-balkon': {
    heroTitle: 'Выносной балкон в Омске',
    heroTitleHighlight: 'реальное расширение площади',
    heroDesc:
      'Увеличиваем балкон выносом конструкции за фасад — усиливаем парапет и плиту, помогаем с согласованием проекта. Больше места для отдыха и хранения. Бесплатный выезд на замер, завод на ул. Гусарова, гарантия 5 лет.',
  },
  'osteklenie-s-vinosom': {
    heroTitle: 'Остекление балкона с выносом в Омске',
    heroTitleHighlight: 'больше места без сложного согласования',
    heroDesc:
      'Комбинируем остекление с расширением по линии подоконника или пола — полезная площадь растёт, а квартира получает больше света. Бесплатный замер, изготовление на заводе по ул. Гусарова, гарантия 5 лет.',
  },
  'vynos-po-podokonniku': {
    heroTitle: 'Вынос остекления по подоконнику в Омске',
    heroTitleHighlight: 'широкий подоконник без нагрузки на плиту',
    heroDesc:
      'Расширяем подоконную доску наружу — появляется место для цветов, декора и мелочей, при этом нагрузка на плиту почти не меняется. Бесплатный выезд замерщика, завод по ул. Гусарова, гарантия 5 лет.',
  },
  'francuzskie-okna': {
    heroTitle: 'Французские окна на балконе в Омске',
    heroTitleHighlight: 'окна от пола до потолка',
    heroDesc:
      'Полноразмерные окна без подоконника наполняют комнату светом и выглядят эффектно с улицы. Перед монтажом усиливаем парапет для безопасности. Бесплатный замер, производство на ул. Гусарова, гарантия 5 лет.',
  },
  'francuzskoe-osteklenie': {
    heroTitle: 'Французское остекление балконов в Омске',
    heroTitleHighlight: 'стиль и максимум дневного света',
    heroDesc:
      'Стеклянная стена от пола до потолка превращает балкон в светлую зону отдыха с современным видом. Проводим осмотр плиты и парапета перед установкой. Бесплатный замер, завод на ул. Гусарова, гарантия 5 лет.',
  },
  'razdvizhnye-sistemy': {
    heroTitle: 'Раздвижное остекление балконов в Омске',
    heroTitleHighlight: 'створки не мешают на балконе',
    heroDesc:
      'Раздвижные створки ездят по направляющим — остаётся место для мебели, сушилки и цветов. Лёгкая конструкция подходит для старых домов. Бесплатный выезд на замер, завод по ул. Гусарова, гарантия 5 лет.',
  },
  'bezramnoe-osteklenie': {
    heroTitle: 'Безрамное остекление балконов в Омске',
    heroTitleHighlight: 'панорамный вид без массивных рам',
    heroDesc:
      'Стеклянные панели без громоздких профилей — максимум обзора и современный внешний вид. Подходит для новостроек и домов с надёжным парапетом. Бесплатный замер, производство на ул. Гусарова, гарантия 5 лет.',
  },
  'uteplenie-penopleksom': {
    heroTitle: 'Утепление балкона в Омске',
    heroTitleHighlight: 'влагостойкая теплоизоляция',
    heroDesc:
      'Укладываем экструдированный утеплитель на пол, стены и потолок лоджии — материал не впитывает влагу и не гниёт. После утепления лоджия заметно теплее зимой. Бесплатный замер, завод на ул. Гусарова, гарантия 5 лет.',
  },
  'uteplenie-penofolom': {
    heroTitle: 'Пароизоляция и утепление лоджии в Омске',
    heroTitleHighlight: 'тепло остаётся внутри',
    heroDesc:
      'Монтируем фольгированную пароизоляцию поверх утеплителя — отражающий слой удерживает тепло и защищает стены от конденсата. Бесплатный выезд замерщика, производство на ул. Гусарова, гарантия 5 лет.',
  },
  'zimnee-sovmeshchenie-s-komnatoy': {
    heroTitle: 'Объединение балкона с комнатой в Омске',
    heroTitleHighlight: 'больше жилого пространства',
    heroDesc:
      'Полный цикл: тёплое остекление, утепление, демонтаж подоконного блока и отделка на одном уровне с комнатой. Помогаем согласовать работы с управляющей компанией. Бесплатный замер, завод на ул. Гусарова, гарантия 5 лет.',
  },
  'otdelka-pvh-panelyami': {
    heroTitle: 'Отделка балкона панелями в Омске',
    heroTitleHighlight: 'быстро, практично, влагостойко',
    heroDesc:
      'Панели на обрешётку — аккуратная отделка без долгой сушки и запахов. Материал не боится перепадов температур и легко моется. Большой выбор цветов и фактур. Бесплатный замер, завод по ул. Гусарова, гарантия 5 лет.',
  },
  'vneshnij-sajding-parapeta': {
    heroTitle: 'Облицовка парапета балкона в Омске',
    heroTitleHighlight: 'защита и аккуратный фасад',
    heroDesc:
      'Облицовываем наружную часть парапета сайдингом — защита от влаги, мороза и трещин в бетоне. Фасад выглядит ухоженно, парапет служит дольше. Бесплатный выезд на замер, завод на ул. Гусарова, гарантия 5 лет.',
  },
  'ukladka-pola-i-laminata': {
    heroTitle: 'Укладка пола на балконе в Омске',
    heroTitleHighlight: 'ровный пол — основа комфорта',
    heroDesc:
      'Выравниваем основание и укладываем ламинат, линолеум или доску — по желанию подключаем тёплый пол. Аккуратные плинтуса и чистовая отделка. Бесплатный замер, производство на ул. Гусарова, гарантия 5 лет.',
  },
  'vstroennaya-mebel-i-shkafy': {
    heroTitle: 'Встроенная мебель на балконе в Омске',
    heroTitleHighlight: 'каждый сантиметр работает',
    heroDesc:
      'Изготавливаем шкафы, тумбы, полки, рабочие столы и сушилки точно по размерам вашей лоджии — никаких зазоров и пустых углов. Бесплатный выезд замерщика, завод по ул. Гусарова, гарантия 5 лет.',
  },
  'zamena-ostekleniya-v-novostrojke': {
    heroTitle: 'Замена остекления в новостройке Омска',
    heroTitleHighlight: 'тёплые рамы вместо холодного от застройщика',
    heroDesc:
      'Демонтируем некачественное остекление застройщика и ставим тёплые рамы в цвет фасада — без претензий от управляющей компании. Работаем во всех новостройках города. Бесплатный замер, завод на ул. Гусарова, гарантия 5 лет.',
  },
  'osteklenie-v-stalinke': {
    heroTitle: 'Остекление балконов в сталинках Омска',
    heroTitleHighlight: 'учитываем высокие потолки и толстые стены',
    heroDesc:
      'Сталинские дома требуют индивидуального подхода: высокие проёмы, массивные парапеты и нестандартные размеры. Делаем проект под каждую квартиру. Бесплатный выезд на замер, завод по ул. Гусарова, гарантия 5 лет.',
  },
  'osteklenie-v-kottedzhe': {
    heroTitle: 'Остекление балконов и террас в Омске',
    heroTitleHighlight: 'для коттеджей и частных домов',
    heroDesc:
      'Остекляем балконы, веранды и террасы в коттеджах — панорамные и тёплые решения для круглогодичного использования. Проектирование и монтаж одной бригадой. Бесплатный замер, завод на ул. Гусарова, гарантия 5 лет.',
  },
  'balkonnye-bloki': {
    heroTitle: 'Балконные блоки в Омске',
    heroTitleHighlight: 'дверь и окно в едином стиле',
    heroDesc:
      'Изготавливаем и монтируем балконные блоки: дверь на лоджию и боковое окно в комнату — единый дизайн, надёжная фурнитура, установка за один день. Бесплатный замер, производство на ул. Гусарова, гарантия 5 лет.',
  },
  'okna-plastikovye': {
    heroTitle: 'Пластиковые окна в Омске',
    heroTitleHighlight: 'напрямую от производителя',
    heroDesc:
      'Изготавливаем пластиковые окна для комнат, кухонь и лоджий на собственном заводе — без посредников и переплат. Энергосберегающие стеклопакеты, аккуратный монтаж. Бесплатный замер, ул. Гусарова, гарантия 5 лет.',
  },
  's-vynosom-po-polu': {
    heroTitle: 'Остекление с выносом по полу в Омске',
    heroTitleHighlight: 'больше площади на балконе',
    heroDesc:
      'Расширяем балкон наружу по линии пола — появляется реальное дополнительное пространство для отдыха и хранения. Перед монтажом усиливаем основание. Бесплатный выезд замерщика, завод на ул. Гусарова, гарантия 5 лет.',
  },
};

const SLUGS = [
  'teploe-osteklenie-pvh', 'holodnoe-osteklenie-al', 'panoramnoe-osteklenie',
  'osteklenie-v-hhrushchevke', 'obshivka-evrovagonkoy', 'krysha-na-balkon',
  'vnutrennyaya-otdelka', 'kompleksnoe-uteplenie', 'balkony-pod-klyuch',
  'pryamoy-balkon', 'g-obraznyj-balkon', 'p-obraznyj-balkon', 'erkernyj-balkon',
  'lodzhiya-3-metra', 'lodzhiya-6-metrov', 'vynosnoj-balkon', 'osteklenie-s-vinosom',
  'vynos-po-podokonniku', 'francuzskie-okna', 'francuzskoe-osteklenie',
  'razdvizhnye-sistemy', 'bezramnoe-osteklenie', 'uteplenie-penopleksom',
  'uteplenie-penofolom', 'zimnee-sovmeshchenie-s-komnatoy', 'otdelka-pvh-panelyami',
  'vneshnij-sajding-parapeta', 'ukladka-pola-i-laminata', 'vstroennaya-mebel-i-shkafy',
  'zamena-ostekleniya-v-novostrojke', 'osteklenie-v-stalinke', 'osteklenie-v-kottedzhe',
  'balkonnye-bloki', 'okna-plastikovye', 's-vynosom-po-polu',
];

function escapeSingleQuotes(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

const HERO_BLOCK_RE =
  /heroTitle:\s*'(?:[^'\\]|\\.)*',\s*heroTitleHighlight:\s*'(?:[^'\\]|\\.)*',\s*heroDesc:\s*\n\s*'(?:[^'\\]|\\.)*',/s;

function replaceHeroForSlug(content, slug, hero, sectionStart, sectionEnd) {
  const marker = `'${slug}': {`;
  const start = content.indexOf(marker, sectionStart);
  if (start === -1 || start >= sectionEnd) {
    return { content, ok: false, reason: 'slug not found in HAND_CRAFTED section' };
  }

  const seoIdx = content.indexOf('seoText:', start);
  if (seoIdx === -1 || seoIdx >= sectionEnd) {
    return { content, ok: false, reason: 'seoText not found' };
  }

  const block = content.slice(start, seoIdx);
  const replacement =
    `heroTitle: '${escapeSingleQuotes(hero.heroTitle)}',\n` +
    `    heroTitleHighlight: '${escapeSingleQuotes(hero.heroTitleHighlight)}',\n` +
    `    heroDesc:\n` +
    `      '${escapeSingleQuotes(hero.heroDesc)}',`;

  if (!HERO_BLOCK_RE.test(block)) {
    return { content, ok: false, reason: 'hero block regex mismatch' };
  }

  const newBlock = block.replace(HERO_BLOCK_RE, replacement);
  const newContent = content.slice(0, start) + newBlock + content.slice(seoIdx);
  return { content: newContent, ok: true };
}

function fixSeedToFallbackTopCard(content) {
  const seedFnStart = content.indexOf('function seedToFallback');
  const seedFnEnd = content.indexOf('const EXTRA_SERVICE_SEEDS', seedFnStart);
  if (seedFnStart === -1 || seedFnEnd === -1) {
    return { content, fixed: false };
  }
  const seedFn = content.slice(seedFnStart, seedFnEnd);
  const gostRe = /topCard2Desc:\s*'([^']*)',/;
  const m = seedFn.match(gostRe);
  if (!m || !m[1].includes('ГОСТ')) {
    return { content, fixed: false };
  }
  const newDesc = m[1].includes('по ГОСТ')
    ? 'На материалы и монтаж'
    : m[1].replace(/по ГОСТ/g, 'на материалы и монтаж');
  const newSeedFn = seedFn.replace(gostRe, `topCard2Desc: '${newDesc}',`);
  return {
    content: content.slice(0, seedFnStart) + newSeedFn + content.slice(seedFnEnd),
    fixed: true,
  };
}

// ── main ──────────────────────────────────────────────────────────────────────
let content = fs.readFileSync(FILE, 'utf8');

const sectionStart = content.indexOf('const HAND_CRAFTED_SERVICE_FALLBACKS');
const sectionEnd = content.indexOf('const SERVICE_FALLBACKS');
if (sectionStart === -1 || sectionEnd === -1) {
  console.error('Could not find HAND_CRAFTED_SERVICE_FALLBACKS or SERVICE_FALLBACKS markers');
  process.exit(1);
}

const seedFix = fixSeedToFallbackTopCard(content);
content = seedFix.content;

let updated = 0;
const failed = [];

for (const slug of SLUGS) {
  const hero = HEROES[slug];
  if (!hero) {
    failed.push({ slug, reason: 'missing in HEROES map' });
    continue;
  }

  const result = replaceHeroForSlug(content, slug, hero, sectionStart, sectionEnd);
  if (result.ok) {
    content = result.content;
    updated++;
  } else {
    failed.push({ slug, reason: result.reason });
  }
}

fs.writeFileSync(FILE, content, 'utf8');

console.log('HEROES keys count:', Object.keys(HEROES).length);
console.log('seedToFallback topCard2Desc fixed:', seedFix.fixed);
console.log('Services updated:', updated);
console.log('Services failed:', failed.length);
if (failed.length) {
  for (const f of failed) {
    console.log(`  - ${f.slug}: ${f.reason}`);
  }
}
