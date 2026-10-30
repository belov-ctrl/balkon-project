import React from 'react';
import Link from 'next/link';
import FooterDistrictList from './FooterDistrictList';

export default function Footer() {
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
              <Link href="/services/teploe-osteklenie-pvh" style={{ color: '#94a3b8', textDecoration: 'none' }}>Теплое остекление</Link>
              <Link href="/services/holodnoe-osteklenie-al" style={{ color: '#94a3b8', textDecoration: 'none' }}>Холодное остекление</Link>
              <Link href="/services/vnutrennyaya-otdelka" style={{ color: '#94a3b8', textDecoration: 'none' }}>Внутренняя отделка</Link>
              <Link href="/services/kompleksnoe-uteplenie" style={{ color: '#94a3b8', textDecoration: 'none' }}>Утепление лоджий</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: '600', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Контакты</h4>
            <p style={{ fontSize: '18px', margin: '0 0 10px 0', color: '#fff', fontWeight: '600' }}>
              <a href="tel:+79081068352" style={{ color: '#fff', textDecoration: 'none' }}>+7 (908) 106-83-52</a>
            </p>
            <p style={{ fontSize: '14px', margin: '0 0 10px 0' }}>
              <a href="mailto:industrieocon55@mail.ru" style={{ color: '#38bdf8', textDecoration: 'none' }}>industrieocon55@mail.ru</a>
            </p>
            <p style={{ fontSize: '14px', margin: '0 0 10px 0', color: '#94a3b8' }}>г. Омск, ул. Гусарова, д. 26</p>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Работаем ежедневно с 09:00 до 21:00</p>
          </div>
        </div>

        {/* БЛОК СЕО ПЕРЕЛИНКОВКИ РАЙОНОВ (интерактивный аккордеон — клиентский компонент) */}
        <FooterDistrictList />

        {/* КОПИРАЙТ И ОФИЦИАЛЬНЫЕ РЕКВИЗИТЫ КОМПАНИИ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#475569', textAlign: 'left' }}>
          <div>
            <div style={{ fontWeight: '500', color: '#64748b' }}>© 2026 Балконные Решения Омск. Все права защищены.</div>
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
