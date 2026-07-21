'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const footerDistricts = [
  // --- КОЛОНКА 1 ---
  { slug: 'bolshaya-ostrovka',       name: 'Большая Островка' },
  { slug: '11-j-mikrorajon',         name: '11-й микрорайон' },
  { slug: 'amurskij',                name: 'Амурский' },
  { slug: 'pribrezhnyj',             name: 'Прибрежный' },
  { slug: 'kosmos',                  name: 'Космос' },
  { slug: '3-j-mikrorajon',          name: '3-й микрорайон' },
  { slug: 'amurskij-2',              name: 'Амурский-2' },
  { slug: 'pervokirpichnyj',         name: 'Первокирпичный' },
  { slug: 'gorodok-neftyanikov',     name: 'Городок Нефтяников' },
  { slug: 'port-artur',              name: 'Порт-Артур' },
  { slug: 'solnechnyj',              name: 'Солнечный' },
  { slug: 'ryabinovka',              name: 'Рябиновка' },
  { slug: 'linejnyj',                name: 'Линейный' },
  { slug: 'zelyonaya-dolina',        name: 'Зелёная долина' },
  { slug: 'nikolaevka',              name: 'Николаевка' },
  { slug: 'novaya-stanica',          name: 'Новая Станица' },

  // --- КОЛОНКА 2 ---
  { slug: 'kuybyshevskij',           name: 'Куйбышевский' },
  { slug: 'topolinyj',               name: 'Тополиный' },
  { slug: '5-th-mikrorajon',         name: '5-й микрорайон' },
  { slug: 'levoberezhye',            name: 'Левобережье' },
  { slug: 'privokzalnyj',            name: 'Привокзальный' },
  { slug: 'komsomolskij-gorodok',    name: 'Комсомольский городок' },
  { slug: '4-th-mikrorajon',         name: '4-й микрорайон' },
  { slug: 'parkovyj-mikrorajon',     name: 'Парковый микрорайон' },
  { slug: 'zaozyornyj',              name: 'Заозёрный' },
  { slug: 'zahlamino',               name: 'Захламино' },
  { slug: 'moskovka',                name: 'Московка' },
  { slug: 'volzhskij',               name: 'Волжский' },
  { slug: 'karyer',                  name: 'Карьер' },
  { slug: 'yasnaya-polyana',         name: 'Ясная Поляна' },
  { slug: 'severnyj',               name: 'Северный' },
  { slug: 'aleksandrovskaya-usadba', name: 'Александровская усадьба' },

  // --- КОЛОНКА 3 ---
  { slug: 'gorodok-vodnikov',        name: 'Городок Водников' },
  { slug: '12-j-mikrorajon',         name: '12-й микрорайон' },
  { slug: 'polyot',                  name: 'Полёт' },
  { slug: '6-th-mikrorajon',         name: '6-й микрорайон' },
  { slug: 'kirovsk',                 name: 'Кировск' },
  { slug: 'staryj-kirovsk',          name: 'Старый Кировск' },
  { slug: 'leninsk',                 name: 'Ленинск' },
  { slug: 'chkalovskij',             name: 'Чкаловский' },
  { slug: '2-j-mikrorajon',          name: '2-й микрорайон' },
  { slug: 'bolshie-polya',           name: 'Большие Поля' },
  { slug: 'yubilejnyj',              name: 'Юбилейный' },
  { slug: 'bulatovo',                name: 'Булатово' },
  { slug: 'zagorodnyj',              name: 'Загородный' },
  { slug: 'vhodnoj',                 name: 'Микрорайон Входной' },
  { slug: 'cheryomushki',            name: 'Черёмушки' },
  { slug: 'beregovoj',               name: 'Береговой' },

  // --- КОЛОНКА 4 ---
  { slug: 'rybachij',                name: 'Рыбачий' },
  { slug: 'omskij-kristall',         name: 'Омский Кристалл' },
  { slug: 'biofabrika',              name: 'Биофабрика' },
  { slug: 'aviagorodok',             name: 'Авиагородок' },
  { slug: 'kordnyj',                 name: 'Кордный' },
  { slug: '1-j-mikrorajon',          name: '1-й микрорайон' },
  { slug: 'chukreevka',              name: 'Чукреевка' },
  { slug: 'vostochnyj',              name: 'Восточный' },
  { slug: 'cheredovyj',              name: 'Чередовый' },
  { slug: 'stepnoj',                 name: 'Степной' },
  { slug: 'dalnij',                  name: 'Дальний' },
  { slug: 'armejskij',               name: 'Армейский' },
  { slug: 'ostashkovo',              name: 'Осташково' },
  { slug: 'svetlyj',                 name: 'Светлый' },
  { slug: 'cheryomuhovskoe',         name: 'Черёмуховское' },
  { slug: 'krutaya-gorka',           name: 'Крутая Горка' },
];

export default function FooterDistrictList() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b', padding: '24px 0', marginBottom: '30px', textAlign: 'left' }}>
      <button
        onClick={() => setIsOpen(v => !v)}
        style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0, outline: 'none' }}
        aria-expanded={isOpen}
      >
        <span>{isOpen ? '▼' : '►'} Остекление балконов по микрорайонам Омска (64 локации)</span>
      </button>

      {isOpen && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px 20px', paddingTop: '20px', fontSize: '13px' }}>
          {footerDistricts.map((dist) => (
            <Link
              key={dist.slug}
              href={`/${dist.slug}`}
              style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              Балконы {dist.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
