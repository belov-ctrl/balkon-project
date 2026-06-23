'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Список районов (зафиксирован)
const districtsList = [ 
  { name: 'Большая Островка', slug: 'bolshaya-ostrovka' }, { name: 'Куйбышевский', slug: 'kuybyshevskij' }, { name: 'Городок Водников', slug: 'gorodok-vodnikov' }, { name: 'Рыбачий', slug: 'rybachij' }, { name: '11-й микрорайон', slug: '11-j-mikrorajon' }, { name: 'Тополиный', slug: 'topolinyj' }, { name: '12-й микрорайон', slug: '12-j-mikrorajon' }, { name: 'Омский Кристалл', slug: 'omskij-kristall' }, { name: 'Амурский', slug: 'amurskij' }, { name: '5-й микрорайон', slug: '5-th-mikrorajon' }, { name: 'Полёт', slug: 'polyot' }, { name: 'Биофабрика', slug: 'biofabrika' }, { name: 'Прибрежный', slug: 'pribrezhnyj' }, { name: 'Левобережье', slug: 'levoberezhye' }, { name: '6-й микрорайон', slug: '6-th-mikrorajon' }, { name: 'Авиагородок', slug: 'aviagorodok' }, { name: 'Космос', slug: 'kosmos' }, { name: 'Привокзальный', slug: 'privokzalnyj' }, { name: 'Кировск', slug: 'kirovsk' }, { name: 'Кордный', slug: 'kordnyj' }, { name: '3-й микрорайон', slug: '3-j-mikrorajon' }, { name: 'Комсомольский городок', slug: 'komsomolskij-gorodok' }, { name: 'Ленинск', slug: 'leninsk' }, { name: '1-й микрорайон', slug: '1-j-mikrorajon' }, { name: 'Амурский-2', slug: 'amurskij-2' }, { name: '4-й микрорайон', slug: '4-th-mikrorajon' }, { name: 'Чкаловский', slug: 'chkalovskij' }, { name: 'Чукреевка', slug: 'chukreevka' }, { name: 'Первокирпичный', slug: 'pervokirpichnyj' }, { name: 'Парковый микрорайон', slug: 'parkovyj-mikrorajon' }, { name: '2-й микрорайон', slug: '2-j-mikrorajon' }, { name: 'Восточный', slug: 'vostochnyj' }, { name: 'Городок Нефтяников', slug: 'gorodok-neftyanikov' }, { name: 'Заозёрный', slug: 'zaozyornyj' }, { name: 'Старый Кировск', slug: 'staryj-kirovsk' }, { name: 'Чередовый', slug: 'cheredovyj' }, { name: 'Порт-Артур', slug: 'port-artur' }, { name: 'Захламино', slug: 'zahlamino' }, { name: 'Большие Поля', slug: 'bolshie-polya' }, { name: 'Степной', slug: 'stepnoj' }, { name: 'Солнечный', slug: 'solnechnyj' }, { name: 'Московка', slug: 'moskovka' }, { name: 'Юбилейный', slug: 'yubilejnyj' }, { name: 'Дальний', slug: 'dalnij' }, { name: 'Рябиновка', slug: 'ryabinovka' }, { name: 'Волжский', slug: 'volzhskij' }, { name: 'Булатово', slug: 'bulatovo' }, { name: 'Армейский', slug: 'armejskij' }, { name: 'Линейный', slug: 'linejnyj' }, { name: 'Карьер', slug: 'karyer' }, { name: 'Загородный', slug: 'zagorodnyj' }, { name: 'Осташково', slug: 'ostashkovo' }, { name: 'Зелёная долина', slug: 'zelyonaya-dolina' }, { name: 'Ясная Поляна', slug: 'yasnaya-polyana' }, { name: 'микрорайон Входной', slug: 'vhodnoj' }, { name: 'Светлый', slug: 'svetlyj' }, { name: 'Николаевка', slug: 'nikolaevka' }, { name: 'Северный', slug: 'severnyj' }, { name: 'Черёмушки', slug: 'cheryomushki' }, { name: 'Черёмуховское', slug: 'cheryomuhovskoe' }, { name: 'Новая Станица', slug: 'novaya-stanica' }, { name: 'Александровская усадьба', slug: 'aleksandrovskaya-usadba' }, { name: 'Береговой', slug: 'beregovoj' }, { name: 'Крутая Горка', slug: 'krutaya-gorka' }
];

// Полная SEO-структура меню под многостраничник
const navigationMenu = [
  {
    id: 'balkony',
    title: 'Балконы и лоджии',
    items: ['Прямой балкон', 'Г-образный балкон', 'П-образный балкон', 'Эркерный балкон', 'Лоджия 3 метра', 'Лоджия 6 метров', 'Крыша на балкон', 'Выносной балкон']
  },
  {
    id: 'glazing',
    title: 'Варианты остекления',
    items: ['Теплое остекление (ПВХ)', 'Холодное остекление (AL)', 'Панорамное остекление', 'Французские окна', 'Раздвижные системы', 'Безрамное остекление']
  },
  {
    id: 'insulation',
    title: 'Утепление',
    items: ['Комплексное утепление', 'Утепление Пеноплэксом', 'Утепление Пенофолом', 'Зимнее совмещение с комнатой']
  },
  {
    id: 'finishing',
    title: 'Отделка',
    items: ['Внутренняя отделка', 'Обшивка евровагонкой', 'Отделка ПВХ панелями', 'Внешний сайдинг парапета', 'Укладка пола и ламината', 'Встроенная мебель и шкафы']
  },
  {
    id: 'layouts',
    title: 'По планировкам',
    items: ['Замена остекления в новостройке', 'Остекление в Хрущевке', 'Остекление в Сталинке', 'Остекление в Коттедже', 'Панорамное', 'Французское', 'Безрамное', 'Теплое', 'Холодное', 'С выносом по полу', 'Вынос по подоконнику']
  }
];

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  // Состояния мобильных аккордеонов
  const [mobileOpenSection, setMobileOpenOpenSection] = useState<string | null>(null);

  // Состояние всплывающей формы шапки
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [headerModalTitle, setHeaderModalTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // УМНАЯ ФУНКЦИЯ МАСКИ ДЛЯ РОССИЙСКИХ НОМЕРОВ ТЕЛЕФОНА
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    
    // Если вводят 8 или 7 в начале — срезаем, мы жестко подставим +7
    if (input.startsWith('7') || input.startsWith('8')) {
      input = input.substring(1);
    }
    // Ограничиваем длину строго 10 цифрами самого мобильного номера
    input = input.substring(0, 10);

    let formatted = '';
    if (input.length > 0) {
      formatted = '+7 (' + input.substring(0, 3);
    }
    if (input.length > 3) {
      formatted += ') ' + input.substring(3, 6);
    }
    if (input.length > 6) {
      formatted += '-' + input.substring(6, 8);
    }
    if (input.length > 8) {
      formatted += '-' + input.substring(8, 10);
    }
    
    e.target.value = input ? formatted : '';
  };

  const triggerForm = (title: string) => {
    setHeaderModalTitle(title);
    setIsHeaderModalOpen(true);
    setIsMobileMenuOpen(false); 
  };

  const toggleMobileSection = (id: string) => {
    setMobileOpenOpenSection(mobileOpenSection === id ? null : id);
  };

  return (
    <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100000 }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .status-light { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
        .district-link:hover, .dropdown-item-link:hover { color: #2563eb !important; background-color: #f8fafc; border-radius: 6px; }
        
        .mobile-only-block { display: none !important; }
        .hamburger-container { display: none !important; }
        
        .desktop-dropdown-box {
          position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
          background: #fff; padding: 14px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          display: flex; flex-direction: column; gap: 4px; border-radius: 12px; z-index: 110000;
          border: 1px solid #e2e8f0; width: 280px; text-align: left;
        }

        @media (max-width: 1120px) {
          .nav-links-wrap { gap: 20px !important; }
        }

        @media (max-width: 991px) {
          .desktop-only-block { display: none !important; }
          .hamburger-container { display: flex !important; }
          .header-row-1 { padding: 12px 16px !important; }
          .logo-text { font-size: 17px !important; }
          
          .menu-open .line1 { transform: translateY(7px) rotate(45deg); }
          .menu-open .line2 { opacity: 0; }
          .menu-open .line3 { transform: translateY(-7px) rotate(-45deg); }
          
          .mobile-only-block.mobile-menu-drawer {
            display: flex !important;
            position: fixed; top: 52px; left: 0; width: 100%; height: calc(100vh - 52px);
            background-color: #ffffff; z-index: 999999; overflow-y: auto; padding: 24px 16px;
            flex-direction: column; gap: 24px; transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); border-top: 1px solid #e2e8f0;
          }
          .mobile-only-block.mobile-menu-drawer.active { transform: translateX(0); }
        }
      `}} />

      {/* СТРОКА 1 */}
      <div className="header-row-1" style={{ maxWidth: '1340px', margin: '0 auto', padding: '15px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        <Link href="/" className="logo-text" style={{ fontSize: '25px', fontWeight: '900', color: '#1e3a8a', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          БАЛКОННЫЕ РЕШЕНИЯ
        </Link>
        
        {/* Информационный блок */}
        <div className="desktop-only-block" style={{ display: 'flex', gap: '25px', alignItems: 'center', fontSize: '13px' }}>
          <div style={{ color: '#475569', fontWeight: '500' }}>🕒 Пн-Вс: 9:00 - 20:00</div>
          <div style={{ color: '#1e293b', fontWeight: '600', padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>12 замерщиков на выезде</div>
          
          <div style={{ textAlign: 'right' }}>
            <a href="tel:83812280230" style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.color = '#1e293b'}>
              8 (3812) 28-02-30
            </a>
            <div style={{ fontSize: '10px', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
              <span className="status-light"></span> ОНЛАЙН
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => triggerForm('Связаться через Telegram')} style={{ padding: '6px 14px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Telegram</button>
            <button onClick={() => triggerForm('Консультация с ведущим мастером Максимом')} style={{ padding: '6px 14px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Макс</button>
          </div>
        </div>

        {/* Бургер и телефон (ПОКАЗЫВАЕТСЯ ТОЛЬКО НА МОБИЛКАХ) */}
        <div className="hamburger-container" style={{ alignItems: 'center', gap: '16px' }}>
          <a href="tel:83812280230" style={{ fontSize: '15px', fontWeight: '700', color: '#1e3a8a', textDecoration: 'none' }}>8 (3812) 28-02-30</a>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 101010 }}
            className={isMobileMenuOpen ? 'menu-open' : ''}
            aria-label="Меню"
          >
            <span className="hamburger-line line1" style={{ width: '24px', height: '2px', backgroundColor: '#1e3a8a', transition: 'all 0.3s ease' }}></span>
            <span className="hamburger-line line2" style={{ width: '24px', height: '2px', backgroundColor: '#1e3a8a', transition: 'all 0.3s ease' }}></span>
            <span className="hamburger-line line3" style={{ width: '24px', height: '2px', backgroundColor: '#1e3a8a', transition: 'all 0.3s ease' }}></span>
          </button>
        </div>
      </div>

      {/* СТРОКА 2 — УМНАЯ СЕО НАВИГАЦИЯ ДЛЯ КОМПЬЮТЕРОВ */}
      <nav className="desktop-only-block" style={{ borderTop: '1px solid #e2e8f0', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <div className="nav-links-wrap" style={{ display: 'flex', gap: '35px', position: 'relative', height: '100%', alignItems: 'center' }}>
          
          {navigationMenu.map((menu) => (
            <div 
              key={menu.id} 
              style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#334155', position: 'relative', height: '100%', display: 'flex', alignItems: 'center', padding: '0 4px' }}
              onMouseEnter={() => setOpenDropdown(menu.id)} 
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <span>{menu.title} ▾</span>
              
              {openDropdown === menu.id && (
                <div className="desktop-dropdown-box">
                  {menu.items.map((subItem) => (
                    <div 
                      key={subItem} 
                      onClick={() => triggerForm(`План страницы: ${subItem}`)}
                      className="dropdown-item-link"
                      style={{ fontSize: '13.5px', color: '#475569', padding: '8px 12px', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                    >
                      📄 {subItem}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Фиксированный список Районов выезда */}
          <div 
            style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#2563eb', position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }} 
            onMouseEnter={() => setOpenDropdown('districts')} 
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <span>Районы выезда ▾</span>
            
            {openDropdown === 'districts' && (
              <div style={{ position: 'absolute', top: '100%', left: '-350px', width: '960px', background: '#fff', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', borderRadius: '12px', zIndex: 110000, border: '1px solid #e2e8f0' }}>
                {districtsList.map(d => (
                  <Link 
                    key={d.slug} 
                    href={`/${d.slug}`}
                    className="district-link"
                    onClick={() => setOpenDropdown(null)}
                    style={{ fontSize: '13px', color: '#475569', textDecoration: 'none', padding: '6px 8px', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                  >
                    📍 {d.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* ВЫДВИЖНОЙ МОБИЛЬНЫЙ БЛОК НАВИГАЦИИ С АККОРДЕОНАМИ */}
      <div className={`mobile-only-block mobile-menu-drawer ${isMobileMenuOpen ? 'active' : ''}`}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', textAlign: 'left' }}>
          
          {navigationMenu.map((menu) => (
            <div key={menu.id} style={{ borderBottom: '1px solid #f8fafc', paddingBottom: '6px' }}>
              <div 
                onClick={() => toggleMobileSection(menu.id)}
                style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', cursor: 'pointer', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>{menu.title}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{mobileOpenSection === menu.id ? '▲' : '▼'}</span>
              </div>
              
              {mobileOpenSection === menu.id && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '12px', marginTop: '4px', borderLeft: '2px solid #e2e8f0' }}>
                  {menu.items.map((subItem) => (
                    <div 
                      key={subItem} 
                      onClick={() => triggerForm(`План страницы: ${subItem}`)}
                      style={{ fontSize: '14px', color: '#475569', padding: '8px 0', cursor: 'pointer' }}
                    >
                      📄 {subItem}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Мобильный аккордеон районов */}
          <div>
            <div 
              onClick={() => toggleMobileSection('districts')} 
              style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb', cursor: 'pointer', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>Районы выезда</span>
              <span style={{ fontSize: '12px' }}>{mobileOpenSection === 'districts' ? '▲' : '▼'}</span>
            </div>
            
            {mobileOpenSection === 'districts' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '14px', maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
                {districtsList.map(d => (
                  <Link 
                    key={d.slug} 
                    href={`/${d.slug}`}
                    onClick={() => { setIsMobileMenuOpen(false); setMobileOpenOpenSection(null); }}
                    style={{ fontSize: '13px', color: '#475569', textDecoration: 'none', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', textAlign: 'left' }}
                  >
                    📍 {d.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Инфо-блок внутри мобильного меню */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', fontSize: '14px' }}>
          <div style={{ color: '#475569', fontWeight: '500' }}>🕒 Режим работы: Пн-Вс: 9:00 - 20:00</div>
          <div style={{ fontWeight: '600', backgroundColor: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', display: 'inline-block', width: 'fit-content' }}>
            <span className="status-light" style={{ marginRight: '6px' }}></span> 12 замерщиков на выезде
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={() => triggerForm('Связаться через Telegram')} style={{ flex: 1, padding: '12px 0', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' }}>Telegram</button>
            <button onClick={() => triggerForm('Консультация с ведущим мастером Максимом')} style={{ flex: 1, padding: '12px 0', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' }}>Макс</button>
          </div>
        </div>
      </div>

      {/* ВСПЛЫВАЮЩЕЕ ОКНО ШАПКИ С ФИЛЬТРОМ ТЕЛЕФОНА */}
      {isHeaderModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '440px', borderRadius: '24px', padding: '36px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative', textAlign: 'left', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            
            <button onClick={() => setIsHeaderModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '24px', color: '#64748b', cursor: 'pointer', outline: 'none' }}>×</button>
            
            <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#1e3a8a', marginBottom: '8px', lineHeight: '1.3', paddingRight: '20px' }}>{headerModalTitle}</h3>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '24px', lineHeight: '1.5' }}>Оставьте ваш номер. Мы мгновенно свяжемся с вами, проконсультируем по выбранному направлению и зафиксируем за вашим номером скидку до 15%.</p>
            
            <form 
              onSubmit={async (e) => { 
                e.preventDefault(); 
                setIsSubmitting(true);
                
                const form = e.target as HTMLFormElement;
                const nameInput = form.querySelector('input[type="text"]') as HTMLInputElement;
                const phoneInput = form.querySelector('input[type="tel"]') as HTMLInputElement;

                try {
                  const res = await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: nameInput.value,
                      phone: phoneInput.value,
                      source: `Шапка сайта: ${headerModalTitle}`
                    })
                  });

                  if (res.ok) {
                    setIsHeaderModalOpen(false);
                    form.reset();
                    router.push('/thanks');
                  } else {
                    alert('Произошла ошибка при отправке конфигурации. Повторите попытку.');
                  }
                } catch {
                  alert('Ошибка подключения к сети.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Ваше имя</label>
                  <input type="text" placeholder="Иван" required style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#fff', color: '#0f172a' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Номер телефона</label>
                  {/* ДОБАВЛЕНА МАСКА И ВАЛИДАЦИЯ ДЛИНЫ СТРОКИ (РОВНО 18 СИМВОЛОВ) */}
                  <input 
                    type="tel" 
                    placeholder="+7 (999) 000-00-00" 
                    onChange={handlePhoneChange}
                    minLength={18}
                    maxLength={18}
                    required 
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none', backgroundColor: '#fff', color: '#0f172a' }} 
                  />
                </div>
                <button type="submit" disabled={isSubmitting} style={{ width: '100%', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', padding: '14px 0', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Отправка данных...' : 'Перезвонить мне'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}