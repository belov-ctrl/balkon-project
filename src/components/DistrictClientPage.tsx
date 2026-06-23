'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Импортируем наши готовые изолированные модули
import Header from '@/components/Header';
import Calculator from '@/components/Calculator';
import Portfolio from '@/components/Portfolio';
import ContactsMap from '@/components/ContactsMap';
import Footer from '@/components/Footer';

// =========================================================================
// ИКОНКИ
// =========================================================================
const RulerIcon = () => (
  <svg width="32" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 6.3V18H17" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 6.3H17" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 18.1V13.1" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WarrantyIcon = () => (
  <svg width="32" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.6 15L12 21L20.4 15V6V15Z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21V12" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12H20.4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// =========================================================================
// БАЗА ДАННЫХ ОТЗЫВОВ И РАЙОНОВ
// =========================================================================
const customerReviews = [
  { name: 'Игорь Васильев', meta: 'Омск, Кировский АО', text: 'Заказывал теплое остекление лоджии. Мастера приехали вовремя, сделали абсолютно всё за один рабочий день. Прошедшую суровую зиму лоджия выдержала на отлично. Отдельное спасибо монтажникам за чистоту после работ.', date: 'Март 2026' },
  { name: 'Елена Миронова', meta: 'Омск, Советский АО', text: 'Очень долго искала компанию, которая согласится сделать качественный балкон с крышей на последнем этаже хрущевки и укрепить старый парапет. Сделали надежно, ничего не течет.', date: 'Май 2026' },
  { name: 'Алексей и Ольга Токаревы', meta: 'Омск, Центральный АО', text: 'Выбрали панорамное французское остекление в пол. Вид потрясающий, в комнате стало намного больше дневного света. Боялись, что зимой будет поддувать, но профиль держит тепло отлично.', date: 'Июнь 2026' }
];

const districtMap: Record<string, { landing: string; geo: string }> = {
  'bolshaya-ostrovka': { landing: 'на Большой Островке', geo: 'микрорайоне Большая Островка' },
  'kuybyshevskij': { landing: 'в Куйбышевском', geo: 'Куйбышевском районе' },
  'gorodok-vodnikov': { landing: 'в Городке Водников', geo: 'Городке Водников' },
  'rybachij': { landing: 'в Рыбачьем', geo: 'посёлке Рыбачий' },
  '11-j-mikrorajon': { landing: 'в 11-м микрорайоне', geo: '11-м микрорайоне' },
  'topolinyj': { landing: 'в Тополином', geo: 'микрорайоне Тополиный' },
  '12-j-mikrorajon': { landing: 'в 12-м микрорайоне', geo: '12-м микрорайоне' },
  'omskij-kristall': { landing: 'в Омском Кристалле', geo: 'ЖК Омский Кристалл' },
  'amurskij': { landing: 'в Амурском посёлке', geo: 'Амурском посёлке' },
  '5-th-mikrorajon': { landing: 'в 5-м микрорайоне', geo: '5-м микрорайоне' },
  'polyot': { landing: 'в районе Полёта', geo: 'районе ДК Полет' },
  'biofabrika': { landing: 'на Биофабрике', geo: 'посёлке Биофабрика' },
  'pribrezhnyj': { landing: 'в Прибрежном', geo: 'микрорайоне Прибрежный' },
  'levoberezhye': { landing: 'на Левом берегу', geo: 'Левобережье' },
  '6-th-mikrorajon': { landing: 'в 6-м микрорайоне', geo: '6-м микрорайоне' },
  'aviagorodok': { landing: 'в Авиагородке', geo: 'Авиагородке' },
  'kosmos': { landing: 'в районе Космоса', geo: 'районе КДЦ Космос' },
  'privokzalnyj': { landing: 'в Привокзальном', geo: 'Привокзальном посёлке' },
  'kirovsk': { landing: 'в Кировском округе', geo: 'Кировском АО' },
  'kordnyj': { landing: 'на Кордном', geo: 'Кордном посёлке' },
  '3-j-mikrorajon': { landing: 'в 3-м микрорайоне', geo: '3-м микрорайоне' },
  'komsomolskij-gorodok': { landing: 'в Комсомольском городке', geo: 'Комсомольском городке' },
  'leninsk': { landing: 'в Ленинском округе', geo: 'Ленинском АО' },
  '1-j-mikrorajon': { landing: 'в 1-м микрорайоне', geo: '1-м микрорайоне' },
  'amurskij-2': { landing: 'в Амуре-2', geo: 'микрорайоне Амурский-2' },
  '4-th-mikrorajon': { landing: 'в 4-м микрорайоне', geo: '4-м микрорайоне' },
  'chkalovskij': { landing: 'в Чкаловском', geo: 'посёлке Чкаловский' },
  'chukreevka': { landing: 'в Чукреевке', geo: 'посёлке Чукреевка' },
  'pervokirpichnyj': { landing: 'в Первокирпичном', geo: 'посёлке Первокирпичный' },
  'parkovyj-mikrorajon': { landing: 'в Парковом', geo: 'Парковом микрорайоне' },
  '2-j-mikrorajon': { landing: 'в 2-м микрорайоне', geo: '2-м микрорайоне' },
  'vostochnyj': { landing: 'в Восточном посёлке', geo: 'посёлке Восточный' },
  'gorodok-neftyanikov': { landing: 'в Нефтяниках', geo: 'Городке Нефтяников' },
  'zaozyornyj': { landing: 'в Заозёрном', geo: 'микрорайоне Заозёрный' },
  'staryj-kirovsk': { landing: 'в Старом Кировске', geo: 'Старом Кировске' },
  'cheredovyj': { landing: 'в Чередовом', geo: 'посёлке Чередовый' },
  'port-artur': { landing: 'в Порт-Артуре', geo: 'посёлке Порт-Артур' },
  'zahlamino': { landing: 'в Захламино', geo: 'микрорайоне Захламино' },
  'bolshie-polya': { landing: 'в Больших Полях', geo: 'посёлке Больших Полей' },
  'stepnoj': { landing: 'в Степном', geo: 'посёлке Степной' },
  'solnechnyj': { landing: 'в Солнечном', geo: 'микрорайоне Солнечный' },
  'moskovka': { landing: 'на Московке', geo: 'микрорайоне Московка' },
  'yubilejnyj': { landing: 'в Юбилейном', geo: 'микрорайоне Юбилейный' },
  'dalnij': { landing: 'в посёлке Дальний', geo: 'посёлке Дальний' },
  'ryabinovka': { landing: 'в Рябиновке', geo: 'микрорайоне Рябиновка' },
  'volzhskij': { landing: 'в Волжском', geo: 'посёлке Волжский' },
  'bulatovo': { landing: 'в Булатово', geo: 'посёлке Булатово' },
  'armejskij': { landing: 'в Армейском', geo: 'посёлке Армейский' },
  'linejnyj': { landing: 'в Линейном', geo: 'посёлке Линейный' },
  'karyer': { landing: 'в Карьере', geo: 'посёлке Карьер' },
  'zagorodnyj': { landing: 'в Загородном', geo: 'посёлке Загородный' },
  'ostashkovo': { landing: 'в Осташково', geo: 'посёлке Осташково' },
  'zelyonaya-dolina': { landing: 'в Зелёной долине', geo: 'коттеджном посёлке Зелёная долина' },
  'yasnaya-polyana': { landing: 'в Ясной Поляне', geo: 'микрорайоне Ясная Поляна' },
  'vhodnoj': { landing: 'во Входном', geo: 'микрорайоне Входной' },
  'svetlyj': { landing: 'в Светлом', geo: 'посёлке Светлый' },
  'nikolaevka': { landing: 'в Николаевке', geo: 'посёлке Николаевка' },
  'severnyj': { landing: 'в Северном посёлке', geo: 'посёлке Северный' },
  'cheryomushki': { landing: 'в Черёмушках', geo: 'посёлке Черёмушки' },
  'cheryomuhovskoe': { landing: 'в Черёмуховском', geo: 'село Черёмуховское' },
  'novaya-stanica': { landing: 'в Новой Станице', geo: 'деревне Новая Станица' },
  'aleksandrovskaya-usadba': { landing: 'в Александровской усадьбе', geo: 'посёлке Александровская усадьба' },
  'beregovoj': { landing: 'в Береговом', geo: 'посёлке Береговой' },
  'krutaya-gorka': { landing: 'в Крутой Горке', geo: 'посёлке Крутая Горка' }
};

// =========================================================================
// ДАННЫЕ ДЛЯ БЛОКОВ
// =========================================================================
const managerPhoto = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600";

const glazingCards = [
  { title: 'Теплое остекление', price: '3 200', desc: 'ПВХ профиль. Подходит для создания жилой комнаты, теплого кабинета или продолжения кухни.', img: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=600', badge: 'Максимум тепла' },
  { title: 'Холодное остекление', price: '2 700', desc: 'Алюминиевый профиль. Легкие удобные раздвижные створки для защиты от ветра, пыли и дождя.', img: 'https://images.unsplash.com/photo-1604079628040-94301bb21b91?q=80&w=600', badge: 'Экономичный выбор' },
  { title: 'Остекление с выносом', price: '4 100', desc: 'Расширение пространства балкона наружу по линии подоконника. Увеличивает реальный объем.', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600', badge: 'Больше места' },
  { title: 'Панорамное остекление', price: '3 500', desc: 'Красивые французские окна от пола до потолка. Дают максимум дневного света, стиля и роскошный обзор.', img: 'https://images.unsplash.com/photo-1527359443443-84a48abc7dfd?q=80&w=600', badge: 'Премиум стиль' }
];

const structuresData = [
  { tabName: 'Прямой балкон', title: 'Прямое остекление лоджий и балконов', desc: 'Классический вариант: остекляется только передняя часть. Боковые стороны полностью закрыты теплыми плитами или глухими пластиковыми панелями.', features: ['Максимальная защита от сильных сквозняков', 'Быстрый и чистый монтаж за несколько часов', 'Идеально подходит под полное объединение с комнатой'], img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800' },
  { tabName: 'Угловой балкон', title: 'Г-образное (угловое) остекление балконов', desc: 'Конструкция состоит из двух надежных рам: широкой передней и одной боковой стеклянной части. Вторая боковая стена — это капитальная стена дома.', features: ['Заметно увеличивает обзор и количество света в комнате', 'Боковую секцию можно сделать матовой или глухой', 'Надежный угловой соединительный стык без промерзания швов'], img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800' },
  { tabName: 'П-образный балкон', title: 'П-образное трёхстороннее остекление', desc: 'Балкон полностью выступает за пределы фасада здания. Остекление монтируется сразу с трех сторон.', features: ['Шикарный панорамный обзор улицы на 180 градусов', 'Можно удобно комбинировать открывающиеся и глухие створки', 'Обязательное укрепление плиты-основания перед началом работ'], img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800' }
];

const insulationServices = [
  { title: 'Комплексное утепление', desc: 'Качественная изоляция по принципу термоса. На вашем балконе будет абсолютно сухо и тепло даже в самые суровые сибирские морозы.', price: '1 200', materials: ['Утеплитель Пеноплэкс (абсолютно не боится влаги)', 'Пароизоляция Пенофол со специальным отражающим слоем', 'Герметизация стыков профессиональной пеной и составом Стиз'], img: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?q=80&w=500' },
  { title: 'Внутренняя отделка', desc: 'Превращаем холодный бетонный балкон в уютную жилую зону, удобное рабочее место или аккуратный уголок для отдыха.', price: '1 500', materials: ['Натуральная деревянная евровагонка высшего сорта', 'Износостойкий ламинат для отделки стен и пола', 'Практичные ПВХ и МДФ панели любых современных цветов'], img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=500' },
  { title: 'Проводка и мебель', desc: 'Добавляем важные и полезные детали, чтобы обновленным пространством лоджии было максимально комфортно пользоваться каждый день.', price: '900', materials: ['Mонтаж безопасного инфракрасного теплого пола с датчиком', 'Удобный вывод розеток, выключателей и точечного света', 'Встроенные шкафчики, тумбы и потолочные сушилки'], img: 'https://images.unsplash.com/photo-1558227691-41ea78d1f632?q=80&w=500' }
];

const advantagesData = [
  { num: '01', title: 'Собственный завод', desc: 'Изготавливаем оконные конструкции на автоматизированном производстве в Омске без наценок перекупщиков.' },
  { num: '02', title: 'Монтаж по ГОСТу', desc: 'Применяем качественные герметики и защитные ленты. Полностью гарантируем отсутствие продуваний.' },
  { num: '03', title: 'Договор и гарантия', desc: 'Оформить документы можно дома или в нашем офисе. Даем честную гарантию 5 лет.' },
  { num: '04', title: 'Опытные мастера', desc: 'В наших монтажных бригадах работают только постоянные специалисты-омичи с опытом работы от 5 лет.' }
];

const additionalServices = [
  { title: 'Балконы под ключ', desc: 'Комплексный ремонт от укрепления плиты до финишного благоустройства.', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=400' },
  { title: 'Внутренняя отделка', desc: 'Профессиональная обшивка стен и потолка долговечными материалами.', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=400' },
  { title: 'Утепление балконов', desc: 'Надежная многослойная теплоизоляция для суровых сибирских зим.', img: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?q=80&w=400' },
  { title: 'Балконные блоки', desc: 'Изготовление и аккуратный монтаж балконной двери и окна в квартиру.', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400' },
  { title: 'Окна пластиковые', desc: 'Морозостойкие энергосберегающие оконные системы для комнат и кухонь.', img: 'https://images.unsplash.com/photo-1604079628040-94301bb21b91?q=80&w=400' }
];

export default function DistrictClientPage({ district, initialData }: { district: string, initialData: any }) {
  const [activeTab, setActiveTab] = useState(0);

  const slug = district || 'omsk';
  const districtStaticData = districtMap[slug] || { 
    landing: `в районе ${slug.charAt(0).toUpperCase() + slug.slice(1)}`, 
    geo: `районе ${slug.charAt(0).toUpperCase() + slug.slice(1)}` 
  };

  const contentData = initialData?.attributes || initialData;

  const displayH1 = contentData?.title || `Остекление и отделка балконов ${districtStaticData.landing}`;
  const visualHeroDesc = `Качественные балконы и окна напрямую от завода-изготовителя. Приедем на замер в ${districtStaticData.geo} сегодня абсолютно бесплатно. Гарантия 5 лет. Установка за 1 день.`;
  
  let displayContent = `Заказывая остекление в ${districtStaticData.geo}, важно учесть сибирский климат. Наша фабрика готова предложить прочные, морозостойкие оконные конструкции по заводским ценам без переплат.`;
  if (contentData?.content) {
    if (typeof contentData.content === 'string') {
      displayContent = contentData.content;
    } else if (Array.isArray(contentData.content)) {
      try {
        displayContent = contentData.content.map((block: any) => block.children?.map((child: any) => child.text).join('')).join(' \n\n');
      } catch (e) {}
    }
  }

  const cleanFonts = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: cleanFonts, color: '#1e293b', WebkitFontSmoothing: 'antialiased' }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        * { box-sizing: border-box !important; }
        .ui-btn { transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease !important; }
        .ui-btn:hover { transform: translateY(-1px); }
        .ui-btn:active { transform: translateY(1px); }
        .hover-card { transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important; }
        .hover-card:hover { transform: translateY(-6px); box-shadow: 0 16px 24px -4px rgba(15, 23, 42, 0.08) !important; }
        .zoom-container { overflow: hidden; }
        .zoom-img { transition: transform 0.4s ease !important; }
        .hover-card:hover .zoom-img { transform: scale(1.06) !important; }
        
        .marquee-container {
          display: flex; overflow: hidden; width: 100%; user-select: none;
          background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;
        }
        .marquee-track {
          display: flex; white-space: nowrap; gap: 80px; padding: 26px 0;
          animation: scrollMarquee 25s linear infinite;
        }
        .brand-item { display: flex; align-items: center; gap: 80px; opacity: 0.4; transition: all 0.2s ease; cursor: default; }
        .brand-item:hover { opacity: 0.9; transform: scale(1.03); }
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }

        .responsive-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
        .responsive-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; }
        .hero-section { padding-bottom: 120px; min-height: 75vh; }
        .hero-title { font-size: 56px; }

        @media (max-width: 991px) {
          .responsive-grid-2 { grid-template-columns: 1fr !important; gap: 32px !important; }
          .responsive-grid-5 { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
          .hero-title { font-size: 34px !important; }
          .hero-desc { font-size: 16px !important; }
          .hero-section { padding-bottom: 40px !important; }
          .section-padding { padding: 50px 0 !important; }
          .section-title { font-size: 26px !important; }
          .floating-cards-container { position: relative !important; bottom: 0 !important; left: 0 !important; transform: none !important; margin-top: 30px !important; padding: 0 16px !important; }
          .floating-cards-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .tab-content-box { grid-template-columns: 1fr !important; padding: 20px !important; gap: 24px !important; }
          .tab-img-box { height: 220px !important; }
          .blue-form-container { flex-direction: column !important; text-align: center !important; padding: 32px 16px !important; }
          .blue-form-text { text-align: center !important; min-width: 100% !important; }
          .blue-form-inputs-row { flex-direction: column !important; gap: 12px !important; width: 100% !important; }
          .blue-form-inputs-row input { width: 100% !important; }
          .blue-form-inputs-row button { width: 100% !important; }
        }
      `}} />

      {/* ШАПКА */}
      <Header />

      {/* ГЛАВНЫЙ БЛОК */}
      <main style={{ position: 'relative', width: '100%' }}>
        <section className="hero-section" style={{ width: '100%', backgroundImage: `url(https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=1920)`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.75)', zIndex: 1 }}></div>
          <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '0 20px', position: 'relative', zIndex: 10, paddingTop: '40px' }}>
            <div style={{ maxWidth: '780px', textAlign: 'left' }}>
              
              <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 14px', borderRadius: '50px', fontSize: '14px', fontWeight: '600', display: 'inline-block', marginBottom: '16px' }}>
                📍 Бесплатный выезд замерщика в {districtStaticData.geo}
              </span>

              <h1 className="hero-title" style={{ fontWeight: '700', color: '#1e3a8a', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-0.02em' }}>
                {displayH1}
              </h1>
              
              <p className="hero-desc" style={{ fontSize: '22px', color: '#334155', lineHeight: '1.6', marginBottom: '36px', fontWeight: '500' }}>
                {visualHeroDesc}
              </p>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button className="ui-btn" style={{ backgroundColor: '#1e3a8a', color: '#fff', border: 'none', padding: '16px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>Оставить заявку</button>
                <button className="ui-btn" style={{ backgroundColor: 'transparent', color: '#1e3a8a', border: '2px solid #1e3a8a', padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>Узнать об услугах</button>
              </div>
            </div>
          </div>
        </section>
        
        <section className="floating-cards-container" style={{ position: 'absolute', bottom: '-60px', left: '50%', transform: 'translateX(-50%)', maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '0 20px', zIndex: 20 }}>
          <div className="floating-cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '20px', boxShadow: '0 12px 30px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}><RulerIcon /></div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#475569', margin: 0 }}>Отделка 3-метрового балкона</h4>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 10px 0' }}>в {districtStaticData.geo}</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>30 000 руб</p>
              </div>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '20px', boxShadow: '0 12px 30px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}><WarrantyIcon /></div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>Фирменная гарантия</p>
                <p style={{ fontSize: '15px', color: '#475569', margin: '6px 0 0 0', lineHeight: '1.5' }}>Пожизненная надежная защита на крышу балкона по нашей технологии</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* БЕГУЩАЯ СТРОКА */}
      <section className="marquee-container" style={{ paddingTop: '85px' }}>
        <div className="marquee-track">
          {[1, 2, 3].map((loop) => (
            <React.Fragment key={loop}>
              <div className="brand-item"><span style={{ fontSize: '24px', fontWeight: '800', color: '#1e3a8a', letterSpacing: '0.12em', fontStyle: 'italic' }}>REHAU</span><span style={{ color: '#cbd5e1', fontSize: '20px' }}>•</span></div>
              <div className="brand-item"><span style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', letterSpacing: '0.02em', border: '2px solid #0f172a', padding: '2px 10px', borderRadius: '4px', lineHeight: 1 }}>VEKA</span><span style={{ color: '#cbd5e1', fontSize: '20px' }}>•</span></div>
              <div className="brand-item"><span style={{ fontSize: '25px', fontWeight: '700', color: '#1e3a8a', letterSpacing: '-0.03em', fontFamily: 'Impact, sans-serif' }}>KBE</span><span style={{ color: '#cbd5e1', fontSize: '20px' }}>•</span></div>
              <div className="brand-item"><span style={{ fontSize: '21px', fontWeight: '300', color: '#334155', letterSpacing: '0.15em', textTransform: 'uppercase' }}>deceuninck</span><span style={{ color: '#cbd5e1', fontSize: '20px' }}>•</span></div>
              <div className="brand-item"><span style={{ fontSize: '23px', fontWeight: '800', color: '#475569', letterSpacing: '0.04em', textTransform: 'uppercase', textDecoration: 'underline', textDecorationColor: '#2563eb' }}>BRUSBOX</span><span style={{ color: '#cbd5e1', fontSize: '20px' }}>•</span></div>
              <div className="brand-item"><span style={{ fontSize: '22px', fontWeight: '600', color: '#0f172a', letterSpacing: '0.08em' }}>PROPLEX</span><span style={{ color: '#cbd5e1', fontSize: '20px' }}>•</span></div>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* О КОМПАНИИ */}
      <section className="section-padding" style={{ backgroundColor: '#fff', padding: '70px 0 90px 0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div className="responsive-grid-2">
            <div><img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800" alt="Мастер" style={{ width: '100%', height: 'auto', borderRadius: '20px' }} /></div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Работаем на совесть</span>
              <h2 className="section-title" style={{ fontSize: '34px', fontWeight: '700', color: '#1e3a8a', marginBottom: '24px' }}>Заводское качество сборки и монтажа</h2>
              <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.7' }}>Мы — местная омская компания со своим личным производством. Более 10 лет мы создаем комфорт в домах наших земляков, используя проверенные профили, готовые к сибирской зиме.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ЦЕНЫ */}
      <section className="section-padding" style={{ backgroundColor: '#fff', padding: '90px 0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Стоимость услуг</span>
            <h2 className="section-title" style={{ fontSize: '34px', fontWeight: '700', color: '#1e3a8a' }}>Цены на популярные виды остекления</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
            {glazingCards.map((card, idx) => (
              <div key={idx} className="hover-card" style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div className="zoom-container" style={{ height: '200px', width: '100%', position: 'relative' }}>
                  <img className="zoom-img" src={card.img} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', top: '14px', left: '14px', backgroundColor: '#1e3a8a', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{card.badge}</span>
                </div>
                <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '21px', fontWeight: '700', color: '#1e3a8a', margin: '0 0 10px 0' }}>{card.title}</h3>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 20px 0', flexGrow: 1 }}>{card.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>от</span>
                    <span style={{ fontSize: '28px', fontWeight: '700', color: '#1e3a8a', letterSpacing: '-0.02em' }}>{card.price} ₽</span>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>/ м²</span>
                  </div>
                  <button className="ui-btn" style={{ width: '100%', backgroundColor: '#fff', color: '#1e3a8a', border: '1px solid #cbd5e1', padding: '12px 0', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Рассчитать стоимость</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* БЫСТРАЯ ФОРМА */}
      <section style={{ backgroundColor: '#1e3a8a', color: '#fff', width: '100%' }}>
        <div className="blue-form-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '44px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <div className="blue-form-text" style={{ flex: 1, textAlign: 'left' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', margin: 0 }}>Узнайте точную стоимость за 5 минут</h3>
            <p style={{ fontSize: '14px', color: '#93c5fd', margin: '6px 0 0 0', fontWeight: '400', lineHeight: '1.4' }}>Оставьте заявку на бесплатный замер. Приедем {districtStaticData.landing} в удобное время, посчитаем смету и сохраним скидку.</p>
          </div>
          <form style={{ flex: 1.3, display: 'flex', flexDirection: 'column', gap: '8px' }} onSubmit={(e) => e.preventDefault()}>
            <div className="blue-form-inputs-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
              <input type="text" placeholder="Ваше имя" style={{ flex: 1, padding: '14px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#ffffff', fontSize: '14px', color: '#0f172a', outline: 'none' }} />
              <input type="tel" placeholder="+7 (___) ___-__-__" required style={{ flex: 1, padding: '14px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#ffffff', fontSize: '14px', fontWeight: '500', color: '#0f172a', outline: 'none' }} />
              <button type="submit" className="ui-btn" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Вызвать мастера</button>
            </div>
          </form>
        </div>
      </section>

      {/* ПЛАНИРОВКИ */}
      <section className="section-padding" style={{ backgroundColor: '#f8fafc', padding: '90px 0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Конфигурации балконов</span>
            <h2 className="section-title" style={{ fontSize: '34px', fontWeight: '700', color: '#1e3a8a' }}>Решения под планировку вашей квартиры</h2>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '44px', flexWrap: 'wrap' }}>
            {structuresData.map((tab, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)} style={{ padding: '12px 24px', borderRadius: '50px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: activeTab === idx ? '1px solid #1e3a8a' : '1px solid #cbd5e1', backgroundColor: activeTab === idx ? '#1e3a8a' : '#fff', color: activeTab === idx ? '#fff' : '#475569' }}>{tab.tabName}</button>
            ))}
          </div>
          <div className="tab-content-box" style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '44px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a', marginBottom: '16px' }}>{structuresData[activeTab].title}</h3>
              <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.7', marginBottom: '28px' }}>{structuresData[activeTab].desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {structuresData[activeTab].features.map((feat, fIdx) => (
                  <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#2563eb', fontSize: '14px', fontWeight: '700' }}>✓</span><span style={{ fontSize: '15px', color: '#334155' }}>{feat}</span></div>
                ))}
              </div>
            </div>
            <div className="tab-img-box" style={{ width: '100%', height: '360px', position: 'relative' }}>
              <img src={structuresData[activeTab].img} alt="Конструкция" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
            </div>
          </div>
        </div>
      </section>

      {/* УТЕПЛЕНИЕ */}
      <section className="section-padding" style={{ backgroundColor: '#fff', padding: '90px 0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Комплексный подход</span>
            <h2 className="section-title" style={{ fontSize: '34px', fontWeight: '700', color: '#1e3a8a' }}>Утепление и внутренняя отделка лоджий {districtStaticData.landing}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {insulationServices.map((service, sIdx) => (
              <div key={sIdx} className="hover-card" style={{ backgroundColor: '#f8fafc', borderRadius: '20px', padding: '28px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <div className="zoom-container" style={{ width: '100%', height: '160px', borderRadius: '14px', marginBottom: '24px' }}>
                  <img className="zoom-img" src={service.img} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '21px', fontWeight: '700', color: '#1e3a8a', marginBottom: '10px' }}>{service.title}</h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '24px', flexGrow: 1 }}>{service.desc}</p>
                <div style={{ marginBottom: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Что применяем:</span>
                  {service.materials.map((mat, mIdx) => (
                    <div key={mIdx} style={{ display: 'flex', alignItems: 'start', gap: '8px', fontSize: '14px', color: '#334155', marginBottom: '4px' }}>• {mat}</div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <div><span style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a' }}>от {service.price} ₽</span></div>
                  <button className="ui-btn" style={{ backgroundColor: '#fff', color: '#2563eb', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Подробнее</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* КАЛЬКУЛЯТОР */}
      <Calculator />

      {/* ТЕКСТОВЫЙ SEO-БЛОК ДЛЯ СТРАПИ */}
      <section className="section-padding" style={{ backgroundColor: '#fff', padding: '90px 0', textAlign: 'left' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div className="responsive-grid-2">
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1e3a8a', marginBottom: '18px' }}>Остекление балконов {districtStaticData.landing}: как выбрать профиль</h2>
              <p style={{ fontSize: '15.5px', color: '#475569', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {displayContent}
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a', marginBottom: '18px' }}>Внутренняя отделка и благоустройство под ключ</h3>
              <p style={{ fontSize: '15.5px', color: '#475569', lineHeight: '1.7' }}>Мы с удовольствием выполняем обшивку лоджий {districtStaticData.landing} с использованием сертифицированных материалов высшего сорта (натуральная евровагонка, влагостойкий ламинат).</p>
            </div>
          </div>
        </div>
      </section>

      {/* ПРЕИМУЩЕСТВА */}
      <section className="section-padding" style={{ backgroundColor: '#f8fafc', padding: '90px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'left', marginBottom: '50px' }}>
            <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Почему выбирают нас</span>
            <h2 className="section-title" style={{ fontSize: '34px', fontWeight: '700', color: '#1e3a8a' }}>Честный подход к работе</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px' }}>
            {advantagesData.map((adv, aIdx) => (
              <div key={aIdx} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                <span style={{ fontSize: '42px', fontWeight: '700', color: '#2563eb', lineHeight: 1 }}>{adv.num}</span>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a', margin: 0 }}>{adv.title}</h3>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: 0 }}>{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* МЕНЕДЖЕР ОКСАНА */}
      <section className="section-padding" style={{ backgroundColor: '#fff', padding: '100px 0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div className="responsive-grid-2" style={{ alignItems: 'center' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
              <img src={managerPhoto} alt="Оксана" style={{ width: '220px', height: '220px', objectFit: 'cover', borderRadius: '50%', marginBottom: '16px', border: '6px solid #eff6ff', display: 'block' }} />
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0', padding: 0 }}>Оксана Ковалева</h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0', padding: 0 }}>Ведущий менеджер</p>
            </div>

            <div style={{ textAlign: 'left' }}>
              <h2 className="section-title" style={{ fontSize: '36px', fontWeight: '700', color: '#1e3a8a', lineHeight: '1.2', marginBottom: '16px' }}>Уже сделали расчет в других компаниях?</h2>
              <p style={{ fontSize: '16px', color: '#475569', marginBottom: '36px' }}>Пришлите нам готовую смету, и мы гарантированно сделаем цену ниже напрямую от завода!</p>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} onSubmit={(e) => e.preventDefault()}>
                <input type="tel" placeholder="+7 (___) ___-__-__" required style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#fff' }} />
                <button type="submit" className="ui-btn" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '16px 0', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>⇒ Получить цену ниже конкурентов</button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ПОРТФОЛИО */}
      <Portfolio onOpenForm={() => {}} />

      {/* РАССРОЧКА */}
      <section className="section-padding" style={{ backgroundColor: '#f8fafc', padding: '80px 0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div className="responsive-grid-2" style={{ backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '50px', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Финансовый комфорт</span>
              <h2 className="section-title" style={{ fontSize: '34px', fontWeight: '700', color: '#1e3a8a', lineHeight: '1.25', marginBottom: '16px' }}>Установка окон и отделка балконов <br /> в рассрочку 0% без переплат!</h2>
              <p style={{ fontSize: '16px', color: '#475569', marginBottom: '36px' }}>Обустройте лоджию уже сегодня, а платите небольшими равными частями без скрытых комиссий.</p>
              <div style={{ display: 'flex', gap: '40px' }}>
                <div><span style={{ fontSize: '44px', fontWeight: '700', color: '#2563eb' }}>0%</span><span style={{ fontSize: '14px', color: '#475569', display: 'block' }}>Взнос</span></div>
                <div><span style={{ fontSize: '44px', fontWeight: '700', color: '#10b981' }}>0%</span><span style={{ fontSize: '14px', color: '#475569', display: 'block' }}>Переплата</span></div>
                <div><span style={{ fontSize: '44px', fontWeight: '700', color: '#1e3a8a' }}>12 мес</span><span style={{ fontSize: '14px', color: '#475569', display: 'block' }}>Срок</span></div>
              </div>
            </div>
            <div style={{ width: '100%', backgroundColor: '#f8fafc', padding: '36px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#1e3a8a', marginBottom: '8px' }}>Оформить рассрочку</h3>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} onSubmit={(e) => e.preventDefault()}>
                <input type="text" placeholder="Ваше имя" style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#fff' }} />
                <input type="tel" placeholder="Номер телефона" required style={{ padding: '14px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#fff' }} />
                <button type="submit" className="ui-btn" style={{ backgroundColor: '#1e3a8a', color: '#fff', border: 'none', padding: '14px 0', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)' }}>Подать быструю заявку</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ОТЗЫВЫ */}
      <section className="section-padding" style={{ backgroundColor: '#fff', padding: '90px 0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ marginBottom: '44px', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Обратная связь</span>
            <h2 className="section-title" style={{ fontSize: '32px', fontWeight: '700', color: '#1e3a8a' }}>Что говорят омичи о нашей работе</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {customerReviews.map((rev, rIdx) => (
              <div key={rIdx} className="hover-card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'left' }}>
                <div style={{ color: '#f59e0b', marginBottom: '12px' }}>★★★★★</div>
                <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: '1.6' }}>«{rev.text}»</p>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: '14px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1e3a8a', margin: 0 }}>{rev.name}</h4>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{rev.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* СТАТЬИ БЛОГА */}
      <section className="section-padding" style={{ padding: '90px 0', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'left', marginBottom: '40px' }}>
            <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Блог и советы</span>
            <h2 className="section-title" style={{ fontSize: '32px', fontWeight: '700', color: '#1e3a8a' }}>Полезные статьи про остекление и ремонт балконов</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {[
              { title: 'Как подготовить балкон к сибирской зиме: пошаговый гайд', desc: 'Разбираем, какой оконный профиль выдержит сильные морозы до -40°C и какую толщину утеплителя выбрать для лоджии.', img: 'https://images.unsplash.com/photo-1542013936693-8848e5742383?q=80&w=600', url: '#' },
              { title: 'Панорамное остекление в хрущевках: мифы и реальность', desc: 'Выдержит ли старая бетонная плита вес современных французских окон в пол? Тщательно анализируем технические нюансы.', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600', url: '#' },
              { title: 'Чем лучше обшить балкон внутри: евровагонка или ламинат', desc: 'Сравниваем популярные отделочные материалы по цене, практичности и общей долговечности для омского климата.', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600', url: '#' }
            ].map((article, idx) => (
              <div key={idx} className="hover-card" style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <div className="zoom-container" style={{ height: '200px', width: '100%' }}>
                  <img className="zoom-img" src={article.img} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a8a', margin: '0 0 12px 0', lineHeight: '1.4' }}>{article.title}</h3>
                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 20px 0' }}>{article.desc}</p>
                  </div>
                  <Link href={article.url} style={{ color: '#2563eb', fontSize: '14px', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    Читать статью →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ */}
      <section className="section-padding" style={{ backgroundColor: '#fff', padding: '90px 0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <h2 className="section-title" style={{ fontSize: '32px', fontWeight: '700', color: '#1e3a8a' }}>Возможно, вас заинтересуют другие услуги:</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            {additionalServices.map((service, idx) => (
              <div key={idx} className="hover-card" style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className="zoom-container" style={{ height: '140px', width: '100%' }}>
                  <img className="zoom-img" src={service.img} alt="Услуга" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e3a8a', margin: '0 0 4px 0' }}>{service.title}</h3>
                  </div>
                  <button className="ui-btn" style={{ width: '100%', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 0', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Перейти</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ИЗОЛИРОВАННАЯ КАРТА И ПОДВАЛ */}
      <ContactsMap />
      <Footer />

    </div>
  );
}