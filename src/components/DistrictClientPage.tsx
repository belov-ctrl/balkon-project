'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Подключили умный компонент для оптимизации скорости
import { useRouter } from 'next/navigation';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

import Header from '@/components/Header';
import Calculator from '@/components/Calculator';
import Portfolio from '@/components/Portfolio';
import ContactsMap from '@/components/ContactsMap';
import Footer from '@/components/Footer';
import FloatingWidgets from '@/components/FloatingWidgets';

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
// ДЕФОЛТНЫЕ ДАННЫЕ (ФОЛЛБЭКИ НА СЛУЧАЙ ПУСТОЙ CMS)
// =========================================================================
const managerPhoto = "https://balkonreshenie.ru/uploads/firma_po_otdelki_balkonov_8d224645e3.png?updatedAt=2026-06-18T21%3A47%3A24.419Z";

const defaultGlazingCards = [ 
  { title: 'Теплое остекление', price: '3 200', desc: 'ПВХ профиль. Подходит для создания жилой комнаты, теплого кабинета или продолжения кухни.', img: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=600', badge: 'Максимум тепла' }, 
  { title: 'Холодное остекление', price: '2 700', desc: 'Алюминиевый профиль. Легкие удобные раздвижные створки для защиты от ветра, пыли и дождя.', img: 'https://images.unsplash.com/photo-1604079628040-94301bb21b91?q=80&w=600', badge: 'Экономичный выбор' }, 
  { title: 'Остекление с выносом', price: '4 100', desc: 'Расширение пространства балкона наружу по линии подоконника. Увеличивает реальный объем.', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600', badge: 'Больше места' }, 
  { title: 'Панорамное остекление', price: '3 500', desc: 'Красивые французские окна от пола до потолка. Дают максимум дневного света, стиля и роскошный обзор.', img: 'https://images.unsplash.com/photo-1527359443443-84a48abc7dfd?q=80&w=600', badge: 'Премиум стиль' } 
];

const structuresData = [ 
  { tabName: 'Прямой балкон', title: 'Прямое остекление лоджий и балконов', desc: 'Классический вариант: остекляется только передняя часть. Боковые стороны полностью закрыты теплыми плитами или глухими пластиковыми панелями. Самое популярное решение в омских девятиэтажках.', features: ['Максимальная защита от сильных сквозняков', 'Быстрый и чистый монтаж за несколько часов', 'Идеально подходит под полное объединение с комнатой'], img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800' }, 
  { tabName: 'Угловой балкон', title: 'Г-образное (угловое) остекление балконов', desc: 'Конструкция состоит из двух надежных рам: широкой передней и одной боковой стеклянной части. Вторая боковая стена — это капитальная стена дома. Распространено в омских хрущевках.', features: ['Заметно увеличивает обзор и количество света в комнате', 'Боковую секцию можно сделать матовой или глухой', 'Надежный угловой соединительный стык без промерзания швов'], img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800' }, 
  { tabName: 'П-образный балкон', title: 'П-образное трёхстороннее остекление', desc: 'Балкон полностью выступает за пределы фасада здания. Остекление монтируется сразу с трех сторон: большая центральная рама и две боковые.', features: ['Шикарный панорамный обзор улицы на 180 градусов', 'Можно удобно комбинировать открывающиеся и глухие створки', 'Обязательное укрепление плиты-основания перед началом работ'], img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800' } 
];

const insulationServices = [ 
  { title: 'Комплексное утепление', desc: 'Качественная изоляция по принципу термоса. На вашем балконе будет абсолютно сухо и тепло даже в самые суровые сибирские морозы.', price: '1 200', materials: ['Утеплитель Пеноплэкс (абсолютно не боится влаги)', 'Пароизоляция Пенофол со специальным отражающим слоем', 'Герметизация стыков профессиональной пеной и составом Стиз'], img: 'https://balkonreshenie.ru/uploads/thumbnail_Kompleksnoye_utepleniye_balkona_a47ff0fea6.png?updatedAt=2026-06-18T21%3A00%3A08.300Z' }, 
  { title: 'Внутренняя отделка', desc: 'Превращаем холодный бетонный балкон в уютную жилую зону, удобное рабочее место или аккуратный уголок для отдыха.', price: '1 500', materials: ['Натуральная деревянная евровагонка высшего сорта', 'Износостойкий ламинат для отделки стен и пола', 'Практичные ПВХ и МДФ панели любых современных цветов'], img: 'https://balkonreshenie.ru/uploads/thumbnail_Vnutrennyaya_otdelka_balkona_c5925c9216.png?updatedAt=2026-06-18T21%3A45%3A56.280Z' }, 
  { title: 'Проводка и мебель', desc: 'Добавляем важные и полезные детали, чтобы обновленным пространством лоджии было максимально комфортно пользоваться каждый день.', price: '900', materials: ['Mонтаж безопасного инфракрасного теплого пола с датчиком', 'Удобный вывод розеток, выключателей и точечного света', 'Встроенные шкафчики, тумбы и потолочные сушилки'], img: 'https://balkonreshenie.ru/uploads/thumbnail_Provodka_i_mebel_na_balkon_00bad2d485.png?updatedAt=2026-06-18T21%3A46%3A06.978Z' } 
];

const advantagesData = [ { num: '01', title: 'Собственный завод', desc: 'Изготавливаем оконные конструкции на автоматизированном производстве в Омске без наценок перекупщиков.' }, { num: '02', title: 'Монтаж по ГОСТу', desc: 'Применяем качественные герметики и защитные ленты. Полностью гарантируем отсутствие продуваний.' }, { num: '03', title: 'Договор и гарантия', desc: 'Оформить документы можно дома или в нашем офисе. Даем честную гарантию 5 лет.' }, { num: '04', title: 'Опытные мастера', desc: 'В наших монтажных бригадах работают только постоянные специалисты-омичи с опытом работы от 5 лет.' } ];

// ИСПРАВЛЕНО: Изменено название заголовка во избежание дублирования тегов H3
const additionalServices = [ 
  { title: 'Балконы под ключ', desc: 'Комплексный ремонт от укрепления плиты до финишного благоустройства.', img: 'https://balkonreshenie.ru/uploads/thumbnail_remont_balkona_pod_klyuch_296x300_89b3f234ec.png?updatedAt=2026-06-18T21%3A48%3A58.527Z' }, 
  { title: 'Обшивка комнат и лоджий', desc: 'Профессиональная обшивка стен и потолка долговечными материалами.', img: 'https://balkonreshenie.ru/uploads/thumbnail_vnutrennyaya_otdelka_balkona_300x300_fb64c0553f.png?updatedAt=2026-06-18T21%3A46%3A30.816Z' }, 
  { title: 'Утепление балконов', desc: 'Надежная многослойная теплоизоляция для суровых сибирских зим.', img: 'https://balkonreshenie.ru/uploads/thumbnail_uteplenie_balkonov_i_lodzhij_300x300_dd1cc9fb2a.jpg?updatedAt=2026-06-18T21%3A46%3A55.398Z' }, 
  { title: 'Балконные блоки', desc: 'Изготовление и аккуратный монтаж балконной двери и окна в квартиру.', img: 'https://balkonreshenie.ru/uploads/thumbnail_Balkonnii_blok_ed05814945.jpg?updatedAt=2026-06-18T21%3A55%3A33.803Z' }, 
  { title: 'Окна пластиковые', desc: 'Морозостойкие энергосберегающие оконные системы для комнат и кухонь.', img: 'https://balkonreshenie.ru/uploads/thumbnail_Plastikovoe_okno_a67ec4ad8e.jpg?updatedAt=2026-06-18T21%3A49%3A13.314Z' } 
];

const customerReviews = [ { name: 'Игорь Васильев', meta: 'Омск, Кировский АО (ул. Конева)', text: 'Заказывал теплое остекление лоджии. Masters приехали вовремя, сделали абсолютно всё за один рабочий день. Прошедшую суровую зиму лоджия выдержала на отлично...', date: 'Март 2026' }, { name: 'Елена Миронова', meta: 'Омск, Советский АО (Нефтяники)', text: 'Очень долго искала компанию, которая согласится сделать качественный балкон с крышей на последнем этаже хрущевки и укрепить старый парапет...', date: 'Май 2026' }, { name: 'Алексей и Ольга Токаревы', meta: 'Омск, Центральный АО (Амур-2)', text: 'Выбрали панорамное французское остекление в пол. Вид потрясающий, в комнате стало намного больше дневного света...', date: 'Июнь 2026' } ];

interface HomeClientPageProps {
  initialData: any;
  articlesData?: any[];
}

export default function HomeClientPage({ initialData, articlesData }: HomeClientPageProps) {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter(); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Заявка на бесплатный замер');
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);

  const cleanFonts = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  const content = initialData || {};
  
  const displayBadge = content.heroBadge || '📍 Собственное автоматизированное производство в Омске';
  const displayTitle = content.heroTitle || 'Остекление и отделка балконов';
  const displayHighlight = content.heroTitleHighlight || 'в Омске';
  const displayDesc = content.heroDesc || 'Качественные балконы и окна напрямую от завода-изготовителя. Бесплатный выезд замерщика сегодня. Гарантия 5 лет. Установка за 1 день.';

  // ФУНКЦИЯ ФОРМАТИРОВАНИЯ ВВОДА ТЕЛЕФОНА ДЛЯ ВСЕХ ФОРМ НА СТРАНИЦЕ
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.startsWith('7') || input.startsWith('8')) {
      input = input.substring(1);
    }
    input = input.substring(0, 10);

    let formatted = '';
    if (input.length > 0) formatted = '+7 (' + input.substring(0, 3);
    if (input.length > 3) formatted += ') ' + input.substring(3, 6);
    if (input.length > 6) formatted += '-' + input.substring(6, 8);
    if (input.length > 8) formatted += '-' + input.substring(8, 10);
    
    e.target.value = input ? formatted : '';
  };

  let displayBg = 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=1920';
  let rawBg = content.heroBackground;
  let bgUrl = Array.isArray(rawBg) ? rawBg[0]?.url : rawBg?.url;
  if (bgUrl) {
    displayBg = bgUrl.startsWith('http') ? bgUrl : `https://balkonreshenie.ru${bgUrl}`;
  }

  let aboutBg = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800';
  let rawAboutImg = content.aboutImage;
  let aboutUrl = Array.isArray(rawAboutImg) ? rawAboutImg[0]?.url : rawAboutImg?.url;
  if (aboutUrl) {
    aboutBg = aboutUrl.startsWith('http') ? aboutUrl : `https://balkonreshenie.ru${aboutUrl}`;
  }

  const activeGlazingCards = content.glazingCard && content.glazingCard.length > 0 ? content.glazingCard : defaultGlazingCards;
  const activeTabsData = content.StructureTab && content.StructureTab.length > 0 ? content.StructureTab : structuresData;
  const currentTab = activeTabsData[activeTab] || activeTabsData[0] || {};

  let tabImgUrl = '';
  let rawTabImg = currentTab.img;
  let tabUrl = Array.isArray(rawTabImg) ? rawTabImg[0]?.url : rawTabImg?.url;
  if (tabUrl) {
    tabImgUrl = tabUrl.startsWith('http') ? tabUrl : `https://balkonreshenie.ru${tabUrl}`;
  } else {
    tabImgUrl = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800';
  }

  let featuresArray: string[] = [];
  if (Array.isArray(currentTab.features)) {
    featuresArray = currentTab.features;
  } else if (typeof currentTab.features === 'string') {
    featuresArray = currentTab.features.split('\n').filter(Boolean);
  }

  const openForm = (title: string) => {
    setModalTitle(title);
    setIsModalOpen(true);
  };

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: cleanFonts, color: '#1e293b', WebkitFontSmoothing: 'antialiased' }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        * { box-sizing: border-box !important; }
        .section-padding { padding: 90px 0; }
        .responsive-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
        .ui-btn { transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease !important; }
        .ui-btn:hover { transform: translateY(-1px); }
        .ui-btn:active { transform: translateY(1px); }
        .hover-card { transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important; }
        .hover-card:hover { transform: translateY(-6px); box-shadow: 0 16px 24px -4px rgba(15, 23, 42, 0.08) !important; }
        .zoom-container { overflow: hidden; position: relative; }
        .zoom-img { transition: transform 0.4s ease !important; }
        .hover-card:hover .zoom-img { transform: scale(1.06) !important; }
        
        .marquee-container { display: flex; overflow: hidden; width: 100%; user-select: none; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
        .marquee-track { display: flex; white-space: nowrap; gap: 80px; padding: 26px 0; animation: scrollMarquee 25s linear infinite; }
        .brand-item { display: flex; align-items: center; gap: 80px; opacity: 0.4; transition: all 0.2s ease; cursor: default; }
        .brand-item:hover { opacity: 0.9; transform: scale(1.03); }
        
        @keyframes scrollMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        
        .tab-content-box { background-color: #fff; border-radius: 24px; padding: 44px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: center; }
        .tab-img-box { width: 100%; height: 360px; position: relative; }
        .blue-form-container { max-width: 1240px; margin: 0 auto; padding: 44px 20px; display: flex; justify-content: space-between; align-items: center; gap: 40px; flex-wrap: wrap; }
        .blue-form-inputs-row { display: flex; gap: 12px; align-items: center; width: 100%; }
        .installment-card { background-color: #fff; border-radius: 24px; border: 1px solid #e2e8f0; padding: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .stats-row { display: flex; gap: 40px; }

        .seo-content { column-count: 1; }
        @media (min-width: 992px) { .seo-content { column-count: 2; column-gap: 60px; } }
        .seo-content h2 { font-size: 32px; font-weight: 700; color: #1e3a8a; margin-top: 0; margin-bottom: 24px; column-span: all; }
        .seo-content h3 { font-size: 22px; font-weight: 700; color: #1e3a8a; margin-top: 24px; margin-bottom: 16px; break-after: avoid; }
        .seo-content p { margin-bottom: 16px; break-inside: avoid-column; }
        .seo-content ul, .seo-content ol { margin-bottom: 24px; padding-left: 24px; break-inside: avoid-column; }
        .seo-content li { margin-bottom: 8px; }
        .seo-content strong { color: #0f172a; font-weight: 600; }

        .hero-section { padding-bottom: 120px; min-height: 75vh; position: relative; display: flex; align-items: center; }
        .hero-title { font-size: 56px; }

        @media (max-width: 991px) {
          .section-padding { padding: 40px 0 !important; }
          .responsive-grid-2 { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hero-title { font-size: 32px !important; }
          .hero-section { padding-bottom: 40px !important; min-height: auto !important; padding-top: 40px !important; }
          .hero-desc { font-size: 16px !important; margin-bottom: 24px !important; }
          .floating-cards-container { position: relative !important; bottom: 0 !important; left: 0 !important; transform: none !important; margin-top: 40px !important; padding: 0 20px !important; }
          .floating-cards-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .tab-content-box { grid-template-columns: 1fr !important; padding: 20px !important; gap: 24px !important; }
          .tab-img-box { height: 260px !important; }
          .blue-form-container { flex-direction: column !important; text-align: center !important; padding: 32px 20px !important; gap: 24px !important; }
          .blue-form-text { text-align: center !important; }
          .blue-form-inputs-row { flex-direction: column !important; gap: 12px !important; }
          .blue-form-inputs-row input, .blue-form-inputs-row button { width: 100% !important; flex: none !important; }
          .installment-card { grid-template-columns: 1fr !important; padding: 24px !important; gap: 32px !important; }
          .stats-row { gap: 20px !important; justify-content: space-between !important; width: 100% !important; }
          .section-title { font-size: 26px !important; }
        }
      `}} />

      <Header />

      {/* ГЛАВНЫЙ БЛОК ОПТИМИЗИРОВАН ЧЕРЕЗ NEXT/IMAGE ДЛЯ ИСКЛЮЧЕНИЯ НАГРУЗКИ НА LCP */}
      <main style={{ position: 'relative', width: '100%' }}>
        <section className="hero-section" style={{ width: '100%' }}>
          <Image 
            src={displayBg}
            alt="Основной фоновый баннер фабрики Балконные Решения Омск"
            fill
            priority={true}
            style={{ objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.75)', zIndex: 1 }}></div>
          <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '0 20px', position: 'relative', zIndex: 10, paddingTop: '40px' }}>
            <div style={{ maxWidth: '780px', textAlign: 'left' }}>
              <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 14px', borderRadius: '50px', fontSize: '14px', fontWeight: '600', display: 'inline-block', marginBottom: '16px' }}>
                {displayBadge}
              </span>
              <h1 className="hero-title" style={{ fontWeight: '700', color: '#1e3a8a', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-0.02em' }}>
                {displayTitle} <span style={{ color: '#2563eb' }}>{displayHighlight}</span>
              </h1>
              <p className="hero-desc" style={{ fontSize: '22px', color: '#334155', lineHeight: '1.6', marginBottom: '36px', fontWeight: '500' }}>
                {displayDesc}
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => openForm('Заявка с главного экрана: Оставить заявку')} className="ui-btn" style={{ backgroundColor: '#1e3a8a', color: '#fff', border: 'none', padding: '16px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>Оставить заявку</button>
                <button onClick={() => setIsCalcModalOpen(true)} className="ui-btn" style={{ backgroundColor: 'transparent', color: '#1e3a8a', border: '2px solid #1e3a8a', padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>Рассчитать стоимость</button>
              </div>
            </div>
          </div>
        </section>
        
        {/* ВИСЯЧИЕ КАРТОЧКИ */}
        <section className="floating-cards-container" style={{ position: 'absolute', bottom: '-60px', left: '50%', transform: 'translateX(-50%)', maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '0 20px', zIndex: 20 }}>
          <div className="floating-cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '20px', boxShadow: '0 12px 30px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}><RulerIcon /></div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#475569', margin: 0 }}>{content.topCard1Title || 'Отделка 3-метрового балкона'}</h4>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 10px 0' }}>{content.topCard1Subtitle || 'в panelных домах Омска'}</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>{content.topCard1Price || '30 000 руб'}</p>
              </div>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '20px', boxShadow: '0 12px 30px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}><WarrantyIcon /></div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e3a8a', margin: 0, letterSpacing: '-0.02em' }}>{content.topCard2Title || 'Фирменная гарантия'}</p>
                <p style={{ fontSize: '15px', color: '#475569', margin: '6px 0 0 0', lineHeight: '1.5' }}>{content.topCard2Desc || 'Пожизненная надежная защита на крышу балкона по нашей технологии'}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* БЕГУЩАЯ СТРОКА ПРОФИЛЕЙ */}
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

      {/* О НАШЕМ ЗАВОДЕ ОПТИМИЗИРОВАНО ЧЕРЕЗ NEXT/IMAGE */}
      <section className="section-padding" style={{ backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div className="responsive-grid-2">
            <div style={{ position: 'relative', width: '100%', height: '350px' }}>
              <Image 
                src={aboutBg} 
                alt={content.aboutTitle || "Заводское производство оконных систем и монтажные бригады в Омске"} 
                fill
                sizes="(max-width: 991px) 100vw, 50vw"
                style={{ objectFit: 'cover', borderRadius: '20px' }}
              />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>{content.aboutBadge || 'Работаем на совесть'}</span>
              <h2 className="section-title" style={{ fontSize: '34px', fontWeight: '700', color: '#1e3a8a', marginBottom: '24px' }}>{content.aboutTitle || 'Заводское качество сборки и монтажа'}</h2>
              <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.7' }}>Мы — местная омская компания со своим личным производство. Более 10 лет мы создаем комфорт в домах наших земляков, используя проверенные профили, готовые к сибирской зиме.</p>
            </div>
          </div>
        </div>
      </section>

      {/* КАРТОЧКИ ВИДОВ ОСТЕКЛЕНИЯ ОПТИМИЗИРОВАНЫ ЧЕРЕЗ NEXT/IMAGE */}
      <section className="section-padding" style={{ backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Стоимость услуг</span>
            <h2 className="section-title" style={{ fontSize: '34px', fontWeight: '700', color: '#1e3a8a' }}>Цены на популярные виды остекления</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {activeGlazingCards.map((card: any, idx: number) => {
              let cardImg = 'https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=600';
              let rawCardImg = card.img;
              let imgUrl = Array.isArray(rawCardImg) ? rawCardImg[0]?.url : rawCardImg?.url;
              if (imgUrl) {
                cardImg = imgUrl.startsWith('http') ? imgUrl : `https://balkonreshenie.ru${imgUrl}`;
              }

              return (
                <div key={idx} className="hover-card" style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                  <div className="zoom-container" style={{ height: '200px', width: '100%' }}>
                    <Image 
                      className="zoom-img" 
                      src={cardImg} 
                      alt={card.title || "Вид остекления балкона в Омске"} 
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />
                    {card.badge && <span style={{ position: 'absolute', top: '14px', left: '14px', backgroundColor: '#1e3a8a', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', zIndex: 1 }}>{card.badge}</span>}
                  </div>
                  <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <h3 style={{ fontSize: '21px', fontWeight: '700', color: '#1e3a8a', margin: '0 0 10px 0' }}>{card.title}</h3>
                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 20px 0', flexGrow: 1 }}>{card.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>от</span>
                      <span style={{ fontSize: '28px', fontWeight: '700', color: '#1e3a8a', letterSpacing: '-0.02em' }}>{card.price}</span>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>/ м²</span>
                    </div>
                    <button onClick={() => setIsCalcModalOpen(true)} className="ui-btn" style={{ width: '100%', backgroundColor: '#fff', color: '#1e3a8a', border: '1px solid #cbd5e1', padding: '12px 0', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Рассчитать стоимость</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* СИНЯЯ ФОРМА ЗАЯВКИ С МАСКОЙ */}
      <section style={{ backgroundColor: '#1e3a8a', color: '#fff', width: '100%' }}>
        <div className="blue-form-container">
          <div className="blue-form-text" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', margin: 0 }}>Узнайте точную стоимость за 5 минут</h3>
            <p style={{ fontSize: '14px', color: '#93c5fd', margin: '6px 0 0 0', fontWeight: '400', lineHeight: '1.4' }}>Оставьте заявку на бесплатный замер. Приедем в удобное время, посчитаем смету и сохраним скидку.</p>
          </div>
          
          <form 
            style={{ flex: 1.3, display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }} 
            onSubmit={async (e) => { 
              e.preventDefault(); 
              const form = e.target as HTMLFormElement;
              const nameInput = form.querySelector('input[placeholder="Ваше имя"]') as HTMLInputElement;
              const phoneInput = form.querySelector('input[type="tel"]') as HTMLInputElement;
              const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
              const originalText = btn.innerText;

              btn.innerText = 'Отправка...';
              btn.disabled = true;

              try {
                const res = await fetch('/api/leads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: nameInput.value,
                    phone: phoneInput.value,
                    source: 'Синяя плашка: Узнайте точную стоимость за 5 минут'
                  })
                });

                if (res.ok) {
                  form.reset();
                  router.push('/thanks');
                } else {
                  alert('Ошибка отправки.');
                }
              } catch {
                alert('Ошибка сети.');
              } finally {
                btn.innerText = originalText;
                btn.disabled = false;
              }
            }}
          >
            <div className="blue-form-inputs-row">
              <input type="text" placeholder="Ваше имя" aria-label="Ваше имя" required style={{ flex: 1, padding: '14px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#ffffff', fontSize: '14px', color: '#0f172a', outline: 'none' }} />
              <input 
                type="tel" 
                placeholder="+7 (999) 000-00-00" 
                aria-label="Номер телефона"
                onChange={handlePhoneChange}
                minLength={18}
                maxLength={18}
                required 
                style={{ flex: 1, padding: '14px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#ffffff', fontSize: '14px', fontWeight: '600', color: '#0f172a', outline: 'none' }} 
              />
              <button type="submit" className="ui-btn" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Вызвать мастера</button>
            </div>
          </form>
        </div>
      </section>

      {/* ДИНАМИЧЕСКИЕ ТАБЫ ПЛАНИРОВОК БАЛКОНОВ ОПТИМИЗИРОВАНЫ */}
      <section className="section-padding" style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Конфигурации balconies</span>
            <h2 className="section-title" style={{ fontSize: '34px', fontWeight: '700', color: '#1e3a8a' }}>Решения под планировку вашей квартиры</h2>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '44px', flexWrap: 'wrap' }}>
            {activeTabsData.map((tab: any, idx: number) => (
              <button key={idx} onClick={() => setActiveTab(idx)} style={{ padding: '12px 24px', borderRadius: '50px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: activeTab === idx ? '1px solid #1e3a8a' : '1px solid #cbd5e1', backgroundColor: activeTab === idx ? '#1e3a8a' : '#fff', color: activeTab === idx ? '#fff' : '#475569' }}>
                {tab.tabName || `Вкладка ${idx + 1}`}
              </button>
            ))}
          </div>

          <div className="tab-content-box">
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a', marginBottom: '16px' }}>{currentTab.title}</h3>
              <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.7', marginBottom: '24px' }}>{currentTab.desc}</p>
              
              {featuresArray.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {featuresArray.map((feat, fIdx) => (
                    <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#2563eb', fontSize: '14px', fontWeight: '700' }}>✓</span>
                      <span style={{ fontSize: '15px', color: '#334155' }}>{feat}</span>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => openForm(`Подробно о конструкции: ${currentTab.title || 'Выбранная планировка'}`)} className="ui-btn" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)' }}>
                Более подробно
              </button>
            </div>

            <div className="tab-img-box">
              <Image 
                src={tabImgUrl} 
                alt={currentTab.title || "Конструкция и форма остекления балкона"} 
                fill
                sizes="(max-width: 991px) 100vw, 50vw"
                style={{ objectFit: 'contain', borderRadius: '8px' }} 
              />
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '44px' }}>
            <button onClick={() => openForm('Каталог: Все виды конструкций балконов')} className="ui-btn" style={{ backgroundColor: 'transparent', color: '#1e3a8a', border: '2px solid #1e3a8a', padding: '14px 44px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
              Все виды конструкций
            </button>
          </div>
        </div>
      </section>

      {/* УТЕПЛЕНИЕ И ОТДЕЛКА ОПТИМИЗИРОВАНО ЧЕРЕЗ NEXT/IMAGE */}
      <section className="section-padding" style={{ backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Комплексный подход</span>
            <h2 className="section-title" style={{ fontSize: '34px', fontWeight: '700', color: '#1e3a8a' }}>Утепление и внутренняя отделка лоджий</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {insulationServices.map((service, sIdx) => (
              <div key={sIdx} className="hover-card" style={{ backgroundColor: '#f8fafc', borderRadius: '20px', padding: '28px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <div className="zoom-container" style={{ width: '100%', height: '160px', marginBottom: '24px', borderRadius: '14px' }}>
                  <Image 
                    className="zoom-img" 
                    src={service.img} 
                    alt={service.title || "Отделочные работы на балконе"} 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }} 
                  />
                </div>
                <h3 style={{ fontSize: '21px', fontWeight: '700', color: '#1e3a8a', marginBottom: '10px' }}>{service.title}</h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px 0', flexGrow: 1 }}>{service.desc}</p>
                <div style={{ marginBottom: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Что применяем:</span>
                  {service.materials.map((mat, mIdx) => (
                    <div key={mIdx} style={{ display: 'flex', alignItems: 'start', gap: '8px', fontSize: '14px', color: '#334155', marginBottom: '4px' }}>• {mat}</div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <div><span style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a' }}>от {service.price} ₽</span></div>
                  <button onClick={() => openForm(`Подробнее об услуге: ${service.title}`)} className="ui-btn" style={{ backgroundColor: '#fff', color: '#2563eb', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Подробнее</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Calculator />

      {content.seoText && (
        <section className="section-padding" style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
            <div className="seo-content" style={{ color: '#334155', fontSize: '16px', lineHeight: '1.8', textAlign: 'left' }}>
              <BlocksRenderer content={content.seoText} />
            </div>
          </div>
        </section>
      )}

      {/* ЧЕСТНЫЙ ПОДХОД */}
      <section className="section-padding" style={{ backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'left', marginBottom: '50px' }}>
            <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Why us</span>
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

      {/* ВЕДУЩИЙ МЕНЕДЖЕР С УМНОЙ ОПТИМИЗАЦИЕЙ КАРТИНКИ */}
      <section className="section-padding" style={{ backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div className="responsive-grid-2" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
              <div style={{ position: 'relative', width: '280px', height: '280px', marginBottom: '16px' }}>
                <Image 
                  src={managerPhoto} 
                  alt="Ведущий менеджер компании Балконные Решения Оксана Ковалева" 
                  width={280}
                  height={280}
                  priority={false} 
                  style={{ objectFit: 'cover', borderRadius: '50%', border: '6px solid #eff6ff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }} 
                />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0', padding: 0 }}>Оксана Ковалева</h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0', padding: 0 }}>Ведущий менеджер</p>
            </div>
            <div style={{ textAlign: 'left' }}>
              <h2 className="section-title" style={{ fontSize: '36px', fontWeight: '700', color: '#1e3a8a', lineHeight: '1.2', marginBottom: '16px' }}>Уже сделали расчет в других компаниях?</h2>
              <p style={{ fontSize: '16px', color: '#475569', marginBottom: '36px' }}>Пришлите нам готовую смету, и мы гарантированно сделаем цену ниже напрямую от завода!</p>
              
              <form 
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const phoneInput = form.querySelector('input[type="tel"]') as HTMLInputElement;
                  const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                  const originalText = btn.innerText;
                  
                  btn.innerText = 'Отправка...';
                  btn.disabled = true;

                  try {
                    const res = await fetch('/api/leads', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: 'Клиент со сметой конкурентов',
                        phone: phoneInput.value,
                        source: 'Форма Оксаны: Заявка на расчет ниже конкурентов'
                      })
                    });

                    if (res.ok) {
                      form.reset();
                      router.push('/thanks');
                    } else {
                      alert('Произошла ошибка при отправке.');
                    }
                  } catch {
                    alert('Ошибка сети.');
                  } finally {
                    btn.innerText = originalText;
                    btn.disabled = false;
                  }
                }}
              >
                <input 
                  type="tel" 
                  placeholder="+7 (999) 000-00-00" 
                  aria-label="Номер телефона для расчёта"
                  onChange={handlePhoneChange}
                  minLength={18}
                  maxLength={18}
                  required 
                  style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none', backgroundColor: '#fff', color: '#0f172a' }} 
                />
                <button type="submit" className="ui-btn" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '16px 0', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>⇒ Получить цену ниже конкурентов</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Portfolio onOpenForm={openForm} />

      {/* ПОЛЕЗНЫЕ СТАТЬИ ИЗ STRAPI ИЛИ ФОЛЛБЭКИ ОПТИМИЗИРОВАНЫ */}
      <section className="section-padding" style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'left', marginBottom: '40px' }}>
            <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Блог и советы</span>
            <h2 className="section-title" style={{ fontSize: '32px', fontWeight: '700', color: '#1e3a8a' }}>Полезные статьи про остекление и ремонт балконов</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {(articlesData && articlesData.length > 0 ? articlesData : [
              { title: 'Как подготовить балкон к сибирской зиме: пошаговый гайт', description: 'Разбираем, какой оконный профиль выдержит сильные морозы до -40°C и какую толщину утеплителя выбрать для лоджии.', img: 'https://balkonreshenie.ru/uploads/thumbnail_Kak_podgotovit_balkon_k_zime_7f6dc23ee6.png?updatedAt=2026-06-18T21%3A48%3A23.194Z', slug: '', isFallback: true },
              { title: 'Панорамное остекление в хрущевках: мифы и реальность', description: 'Выдержит ли старая бетонная плита вес современных французских окон в пол? Тщательно анализируем технические нюансы.', img: 'https://balkonreshenie.ru/uploads/thumbnail_Panoramnoe_osteklenie_v_khrushchevkakh_2e69037ad7.png?updatedAt=2026-06-18T21%3A47%3A40.835Z', slug: '', isFallback: true },
              { title: 'Чем лучше обшить балкон внутри: евровагонка или ламинат', description: 'Сравниваем популярные отделочные материалы по цене, практичности и общей долговечности для омского климата.', img: 'https://balkonreshenie.ru/uploads/thumbnail_Gemini_Generated_Image_ilo4r7ilo4r7ilo4_e7d1e32b45.png?updatedAt=2026-06-18T21%3A47%3A55.875Z', slug: '', isFallback: true }
            ]).map((item: any, idx: number) => {
              const article = item.attributes || item;
              const title = article.title;
              const desc = article.description || article.desc;
              const slug = article.slug || '';
              
              let imgUrl = article.img || 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=600';
              const coverMedia = article.cover?.data?.attributes || article.cover;
              if (coverMedia?.url) {
                const rawUrl = coverMedia.url;
                imgUrl = rawUrl.startsWith('http') ? rawUrl : `https://balkonreshenie.ru${rawUrl}`;
              }

              return (
                <div key={idx} className="hover-card" style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <div className="zoom-container" style={{ height: '200px', width: '100%' }}>
                    <Image 
                      className="zoom-img" 
                      src={imgUrl} 
                      alt={title || "Полезная статья о ремонте балконов"} 
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }} 
                    />
                  </div>
                  <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a8a', margin: '0 0 12px 0', lineHeight: '1.4' }}>{title}</h3>
                      <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 20px 0' }}>{desc}</p>
                    </div>
                    {item.isFallback ? (
                      <button onClick={() => openForm(`Консультация по статье: ${title}`)} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '14px', fontWeight: '600', textDecoration: 'none', textAlign: 'left', padding: 0, cursor: 'pointer' }}>Читать статью →</button>
                    ) : (
                      <Link href={`/blog/${slug}`} style={{ color: '#2563eb', fontSize: '14px', fontWeight: '600', textDecoration: 'none', textAlign: 'left' }}>
                        Читать статью →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ ОПТИМИЗИРОВАНЫ ЧЕРЕЗ NEXT/IMAGE */}
      <section className="section-padding" style={{ backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <h2 className="section-title" style={{ fontSize: '32px', fontWeight: '700', color: '#1e3a8a' }}>Возможно, вас заинтересуют другие услуги:</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {additionalServices.map((service, idx) => (
              <div key={idx} className="hover-card" style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className="zoom-container" style={{ height: '150px', width: '100%', backgroundColor: '#f8fafc' }}>
                  <Image 
                    className="zoom-img" 
                    src={service.img} 
                    alt={service.title || "Дополнительные строительные услуги нашей фабрики в Омске"} 
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    style={{ objectFit: 'contain', padding: '16px' }} 
                  />
                </div>
                <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a8a', margin: '0 0 16px 0' }}>{service.title}</h3>
                  <button onClick={() => openForm(`Интерес к услуге: ${service.title}`)} className="ui-btn" style={{ width: '100%', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px 0', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Перейти</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactsMap />
      <Footer />

      {/* УНИВЕРСАЛЬНОЕ СЕО-ОКНО ЗАХВАТА С МАСКОЙ */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '480px', borderRadius: '24px', padding: '36px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative', animation: 'modalFadeIn 0.2s ease-out', textAlign: 'left' }}>
            
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '24px', color: '#64748b', cursor: 'pointer', outline: 'none' }}>×</button>
            
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1e3a8a', marginBottom: '10px', lineHeight: '1.3', paddingRight: '20px' }}>{modalTitle}</h3>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px', lineHeight: '1.5' }}>Оставьте ваши контакты. Наш менеджер перезвонит в течение 5 минут для уточнения деталей и фиксации персональной скидки.</p>
            
            <form 
              onSubmit={async (e) => { 
                e.preventDefault(); 
                const form = e.target as HTMLFormElement;
                const nameInput = form.querySelector('input[placeholder="Ваше имя"]') as HTMLInputElement;
                const phoneInput = form.querySelector('input[type="tel"]') as HTMLInputElement;
                const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                const originalText = btn.innerText;

                btn.innerText = 'Отправка...';
                btn.disabled = true;

                try {
                  const res = await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: nameInput.value,
                      phone: phoneInput.value,
                      source: modalTitle 
                    })
                  });

                  if (res.ok) {
                    setIsModalOpen(false);
                    form.reset();
                    router.push('/thanks');
                  } else {
                    alert('Ошибка при отправке.');
                  }
                } catch {
                  alert('Ошибка сети.');
                } finally {
                  btn.innerText = originalText;
                  btn.disabled = false;
                }
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label htmlFor="modal-name" style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Ваше имя</label>
                  <input id="modal-name" type="text" placeholder="Ваше имя" required style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label htmlFor="modal-phone" style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Telephone для связи</label>
                  <input 
                    id="modal-phone"
                    type="tel" 
                    placeholder="+7 (999) 000-00-00" 
                    onChange={handlePhoneChange}
                    minLength={18}
                    maxLength={18}
                    required 
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none' }} 
                  />
                </div>
                <button type="submit" className="ui-btn" style={{ width: '100%', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', padding: '16px 0', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)' }}>
                  Отправить заявку
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCalcModalOpen && (
        <Calculator isModal={true} onClose={() => setIsCalcModalOpen(false)} />
      )}

      <FloatingWidgets onOpenCalc={() => setIsCalcModalOpen(true)} />

    </div>
  );
}