'use client';

import React from 'react';
import Image from 'next/image'; // 1. Импортируем встроенный оптимизатор Next.js

const portfolioProjects = [
  { 
    title: 'Ремонт балкона с крышей на последнем этаже «Хрущевки»', 
    location: 'Омск, Советский АО (Нефтяники)', 
    desc: 'Монтаж независимой прочной крыши из стального профлиста с подложкой, укрепление старого металлического парапетного каркаса и установка раздвижной алюминиевой системы.', 
    img: 'https://balkonreshenie.ru/uploads/thumbnail_Remont_balkona_s_krishei_na_poslednem_etazhe_Khrushchevki_a5d3d1b90a.jpg?updatedAt=2026-06-18T23%3A24%3A35.875Z', 
    totalPrice: '61 013', 
    breakdown: [{ name: 'Подготовка парапета к остеклению', cost: '1 610 ₽' }, { name: 'Проектирование и установка крыши', cost: '11 475 ₽' }, { name: 'Алюминиевый раздвижной профиль', cost: '27 590 ₽' }, { name: 'Внутренняя отделка влагостойким ПВХ', cost: '20 338 ₽' }] 
  },
  { 
    title: 'Теплое остекление лоджии 3 метра пластиковым профилем', 
    location: 'Омск, Кировский АО (Левый берег)', 
    desc: 'Капитальное утепление лоджии. Установили проверенный 5-камерный ПВХ профиль Veka Euroline с энергосберегающими стеклопакетами. Финишная обшивка стен ламинатом.', 
    img: 'https://balkonreshenie.ru/uploads/thumbnail_Teploe_osteklenie_lodzhii_3_metra_plastikovim_profilem_61af819026.jpg?updatedAt=2026-06-18T23%3A24%3A54.559Z', 
    totalPrice: '53 412', 
    breakdown: [{ name: 'Подготовка и усиление парапета', cost: '8 360 ₽' }, { name: 'Пластиковые окна Veka Euroline', cost: '27 248 ₽' }, { name: 'Утепление Пеноплэксом 50 мм', cost: '11 504 ₽' }, { name: 'Вывод точечной электрики', cost: '6 300 ₽' }] 
  },
  { 
    title: 'Панорамный французский балкон от пола до потолка KBE', 
    location: 'Омск, Центральный АО (ул. Масленникова)', // Исправлена опечатка в слове Центральный
    desc: 'Полный демонтаж старого ограждения. Установка масштабной французской витражной конструкции на базе теплого ПВХ профиля KBE Master 70 мм с тонировкой.', 
    img: 'https://balkonreshenie.ru/uploads/thumbnail_Panoramnii_frantsuzskii_balkon_ot_pola_do_potolka_KBE_3b5a591f2c.jpg?updatedAt=2026-06-18T23%3A25%3A19.358Z', 
    totalPrice: '77 433', 
    breakdown: [{ name: 'Безопасный демонтаж старого парапета', cost: '6 440 ₽' }, { name: 'Витражная ПВХ система KBE Master', cost: '51 622 ₽' }, { name: 'Мультифункциональные стеклопакеты', cost: '14 371 ₽' }, { name: 'Герметизация наружных швов', cost: '5 000 ₽' }] 
  },
  { 
    title: 'Остекление балкона сибирским морозостойким профилем Exprof', 
    location: 'Омск, Октябрьский АО (Чкаловский)', 
    desc: 'Остекление балкона с использованием адаптированного под наши морозы профиля Exprof Externa. Выполнена внутренняя обшивка сосновой евровагонкой.', 
    img: 'https://balkonreshenie.ru/uploads/thumbnail_Osteklenie_balkona_sibirskim_morozostoikim_profilem_Exprof_e226c4da67.jpg?updatedAt=2026-06-18T23%3A25%3A32.975Z', 
    totalPrice: '57 704', 
    breakdown: [{ name: 'Парапетные работы и герметизация', cost: '3 200 ₽' }, { name: 'Окна Exprof Externa с установкой', cost: '38 469 ₽' }, { name: 'Внутренняя обшивка евровагонкой', cost: '16 035 ₽' }] 
  },
  { 
    title: 'Расширение пространства балкона наружу (Вынос на 30 см)', 
    location: 'Омск, Ленинский АО (Московка)', 
    desc: 'Сварочные работы по созданию прочного стального выносного каркаса по линии подоконника. Установили раздвижное остекление из алюминия.', 
    img: 'https://balkonreshenie.ru/uploads/thumbnail_Rasshirenie_prostranstva_balkona_s_vinosom_naruzhu_1db4d28e4b.jpg?updatedAt=2026-06-18T23%3A25%3A43.799Z', 
    totalPrice: '63 654', 
    breakdown: [{ name: 'Сварочные работы (вынос каркаса)', cost: '8 500 ₽' }, { name: 'Внешняя финишная отделка сайдингом', cost: '1 680 ₽' }, { name: 'Монтаж раздвижной алюминиевой рамы', cost: '32 256 ₽' }, { name: 'Подоконники Crystallit и отливы', cost: '21 218 ₽' }] 
  },
  { 
    title: 'Благоустройство большой 6-метровой лоджии под ключ', 
    location: 'Омск, Кировский АО (ул. Конева)', 
    desc: 'Масштабная работа на длинной лоджии в новостройке. Установка теплой оконной системы Rehau, монтаж теплого пола, обшивка МДФ-панелями и сборка шкафа.', 
    img: 'https://balkonreshenie.ru/uploads/thumbnail_Blagoustroistvo_bolshoi_6_metrovoi_lodzhii_pod_klyuch_9d873ddd6e.jpg?updatedAt=2026-06-18T23%3A25%3A58.483Z', 
    totalPrice: '186 345', 
    breakdown: [{ name: 'Пятикамерное остекление Rehau', cost: '54 870 ₽' }, { name: 'Утепление пола, стен и потолка', cost: '32 000 ₽' }, { name: 'Отделка МДФ панелями и ламинатом', cost: '68 515 ₽' }, { name: 'Инфракрасный теплый пол и шкаф', cost: '30 960 ₽' }] 
  }
];

interface PortfolioProps {
  onOpenForm: (title: string) => void;
}

export default function Portfolio({ onOpenForm }: PortfolioProps) {
  return (
    <section style={{ backgroundColor: '#fff', padding: '60px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '55px', textAlign: 'center' }}>
          <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Наше портфолио</span>
          <h2 style={{ fontSize: '34px', fontWeight: '700', color: '#1e3a8a', letterSpacing: '-0.02em' }}>Примеры выполненных работ и детальный расчет стоимости</h2>
          <p style={{ fontSize: '16px', color: '#64748b', marginTop: '10px' }}>Посмотрите прозрачный разбор реальных смет на остекление и отделку по Омску</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {portfolioProjects.map((project, pIdx) => (
            <div key={pIdx} className="hover-card" style={{ backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', textAlign: 'left', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
              
              <div className="zoom-container" style={{ height: '220px', width: '100%', backgroundColor: '#f8fafc', position: 'relative' }}>
                <Image 
                  className="zoom-img" 
                  src={project.img} 
                  alt={`Пример реализованного проекта компании Балконные Решения: ${project.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'contain', padding: '12px' }} 
                />
              </div>

              <div style={{ padding: '28px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', display: 'block', marginBottom: '6px' }}>{project.location}</span>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a', marginBottom: '12px', lineHeight: '1.3' }}>{project.title}</h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '24px', flexGrow: 1 }}>{project.desc}</p>
                
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '14px', padding: '16px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>Детализация расходов:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {project.breakdown.map((item, bIdx) => (
                      <div key={bIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                        <span style={{ color: '#475569' }}>{item.name}</span>
                        <span style={{ fontWeight: '600', color: '#1e3a8a' }}>{item.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: 'auto' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Итого под ключ</span>
                    <span style={{ fontSize: '26px', fontWeight: '700', color: '#10b981', letterSpacing: '-0.02em' }}>от {project.totalPrice} ₽</span>
                  </div>
                  <button 
                    onClick={() => onOpenForm(`Хочу такой же ремонт: ${project.title}`)}
                    className="ui-btn" 
                    style={{ backgroundColor: '#1e3a8a', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Хочу так же
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}