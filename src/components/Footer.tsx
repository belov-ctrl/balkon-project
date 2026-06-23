'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Массив всех 64 локаций строго по нашему словарю для идеального совпадения ссылок
const footerDistricts = [
  { slug: 'bolshaya-ostrovka', name: 'Большая Островка' },
  { slug: '11-j-mikrorajon', name: '11-й микрорайон' },
  { slug: 'amurskij', name: 'Амурский' },
  { slug: 'pribrezhnyj', name: 'Прибрежный' },
  { slug: 'kosmos', name: 'Космос' },
  { slug: '3-j-mikrorajon', name: '3-й микрорайон' },
  { slug: 'amurskij-2', name: 'Амурский-2' },
  { slug: 'pervokirpichnyj', name: 'Первокирпичный' },
  { slug: 'gorodok-neftyanikov', name: 'Городок Нефтяников' },
  { slug: 'port-artur', name: 'Порт-Артур' },
  { slug: 'solnechnyj', name: 'Солнечный' },
  { slug: 'ryabinovka', name: 'Рябиновка' },
  { slug: 'linejnyj', name: 'Линейный' },
  { slug: 'zelyonaya-dolina', name: 'Зелёная долина' },
  { slug: 'nikolaevka', name: 'Николаевка' },
  { slug: 'novaya-stanica', name: 'Новая Станица' },
  { slug: 'kujbyshevskij', name: 'Куйбышевский' },
  { slug: 'topolinyj', name: 'Тополиный' },
  { slug: '5-j-mikrorajon', name: '5-й микрорайон' },
  { slug: 'levoberezhye', name: 'Левобережье' },
  { slug: 'privokzalnyj', name: 'Привокзальный' },
  { slug: 'komsomolskij-gorodok', name: 'Комсомольский городок' },
  { slug: '4-j-mikrorajon', name: '4-м микрорайон' },
  { slug: 'parkovyj-mikrorajon', name: 'Парковый микрорайон' },
  { slug: 'zaozyornyj', name: 'Заозёрный' },
  { slug: 'zahlamino', name: 'Захламино' },
  { slug: 'moskovka', name: 'Московка' },
  { slug: 'volzhskij', name: 'Волжский' },
  { slug: 'karyer', name: 'Карьер' },
  { slug: 'yasnaya-polyana', name: 'Ясная Поляна' },
  { slug: 'severnyj', name: 'Северный' },
  { slug: 'aleksandrovskaya-usadba', name: 'Александровская усадьба' },
  { slug: 'gorodok-vodnikov', name: 'Городок Водников' },
  { slug: '12-j-mikrorajon', name: '12-й микрорайон' },
  { slug: 'polyot', name: 'Полёт' },
  { slug: '6-j-mikrorajon', name: '6-й микрорайон' },
  { slug: 'kirovsk', name: 'Кировск' },
  { slug: 'staryj-kirovsk', name: 'Старый Кировск' },
  { slug: 'leninsk', name: 'Ленинск' },
  { slug: 'chkalovskij', name: 'Чкаловский' },
  { slug: '2-j-mikrorajon', name: '2-й микрорайон' },
  { slug: 'bolshie-polya', name: 'Большие Поля' },
  { slug: 'yubilejnyj', name: 'Юбилейный' },
  { slug: 'bulatovo', name: 'Булатово' },
  { slug: 'zagorodnyj', name: 'Загородный' },
  { slug: 'mikrorajon-vhodnoj', name: 'Микрорайон Входной' },
  { slug: 'cheryomushki', name: 'Черёмушки' },
  { slug: 'beregovoj', name: 'Береговой' },
  { slug: 'rybachij', name: 'Рыбачий' },
  { slug: 'omskij-kristall', name: 'Омский Кристалл' },
  { slug: 'biofabrika', name: 'Биофабрика' },
  { slug: 'aviagorodok', name: 'Авиагородком' },
  { slug: 'kordnyj', name: 'Кордный' },
  { slug: '1-j-mikrorajon', name: '1-й микрорайон' },
  { slug: 'chukreevka', name: 'Чукреевка' },
  { slug: 'vostochnyj', name: 'Восточный' },
  { slug: 'cheredovyj', name: 'Чередовый' },
  { slug: 'stepnoj', name: 'Степной' },
  { slug: 'dalnij', name: 'Дальний' },
  { slug: 'armejskij', name: 'Армейском' },
  { slug: 'ostashkovo', name: 'Осташково' },
  { slug: 'svetlyj', name: 'Светлый' },
  { slug: 'cheryomuhovskoe', name: 'Черёмуховское' },
  { slug: 'krutaya-gorka', name: 'Крутая Горка' }
];

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '60px 0 30px 0', borderTop: '1px solid #1e293b', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* КЛАССИЧЕСКАЯ НАЧИНКА ФУТЕРА */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: '50px', textAlign: 'left' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Балконные Решения</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#64748b' }}>Производство, установка и финишная отделка пластиковых окон и балконов под ключ в Омске и Омской области.</p>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: '600', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Услуги</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <Link href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Теплое остекление</Link>
              <Link href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Холодное остекление</Link>
              <Link href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Внутренняя отделка</Link>
              <Link href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Утепление лоджий</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: '600', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Контакты</h4>
            {/* Обновленный кликабельный номер телефона */}
            <p style={{ fontSize: '18px', margin: '0 0 10px 0', color: '#fff', fontWeight: '600' }}>
              <a href="tel:83812280230" style={{ color: '#fff', textDecoration: 'none' }}>8 (3812) 28-02-30</a>
            </p>
            {/* Добавленная кликабельная почта */}
            <p style={{ fontSize: '14px', margin: '0 0 10px 0' }}>
              <a href="mailto:industrieocon55@mail.ru" style={{ color: '#38bdf8', textDecoration: 'none' }}>industrieocon55@mail.ru</a>
            </p>
            {/* Актуальный физический адрес из реквизитов */}
            <p style={{ fontSize: '14px', margin: '0 0 10px 0', color: '#94a3b8' }}>г. Омск, ул. Гусарова, д. 26</p>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Работаем ежедневно с 09:00 до 21:00</p>
          </div>
        </div>

        {/* БЛОК СЕО ПЕРЕЛИНКОВКИ РАЙОНОВ */}
        <div style={{ borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b', padding: '24px 0', marginBottom: '30px', textAlign: 'left' }}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0, outline: 'none' }}
          >
            <span>{isOpen ? '▼' : '►'} Остекление балконов по микрорайонам Омска (64 локации)</span>
          </button>

          <div style={{ display: isOpen ? 'grid' : 'none', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px 20px', paddingTop: '20px', fontSize: '13px' }}>
            {footerDistricts.map((dist, index) => (
              <Link 
                key={index} 
                href={`/${dist.slug}`}
                style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                Балконы {dist.name}
              </Link>
            ))}
          </div>
        </div>

        {/* КОПИРАЙТ И ОФИЦИАЛЬНЫЕ РЕКВИЗИТЫ КОМПАНИИ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#475569', textAlign: 'left' }}>
          <div>
            <div style={{ fontWeight: '500', color: '#64748b' }}>© 2026 Балконные Решения Омск. Все права защищены.</div>
            {/* Юридический блок для доверия поисковиков и клиентов */}
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px', lineHeight: '1.4' }}>
              ИП МЫНДИГАРИН К.Ж. • ИНН 561803185225 • Адрес: 644007, Омская область, г. Омск, ул. Гусарова, д. 26
            </div>
          </div>
          <div style={{ alignSelf: 'flex-end' }}>Дизайн и разработка сайта — Cursor Studio</div>
        </div>

      </div>
    </footer>
  );
}