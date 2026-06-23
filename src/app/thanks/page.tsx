'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// ИСПРАВЛЕНО: Добавлен canonical URL для страницы успешной отправки формы
export const metadata = {
  title: 'Заявка успешно принята | Балконные Решения Омск',
  description: 'Спасибо за обращение в нашу компанию! Инженер свяжется с вами в течение 5 минут.',
  alternates: {
    canonical: 'https://balkonreshenie.ru/thanks',
  }
};

export default function ThanksPage() {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Header />

      <main style={{ padding: '80px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#fff', padding: '50px 40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -15px rgba(15,23,42,0.05)' }}>
          
          {/* Красивая галочка успеха */}
          <div style={{ width: '80px', height: '80px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* ИСПРАВЛЕНО: Восстановлен потерянный открывающий тег h1 для предотвращения краша сборки */}
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a8a', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Заявка успешно принята!
          </h1>
          
          <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', margin: '0 0 32px 0' }}>
            Спасибо за доверие! Наш дежурный инженер-технолог уже изучает параметры вашей заявки и перезвонит вам в течение <b>5 минут</b>, чтобы зафиксировать персональную скидку и согласовать время бесплатного замера.
          </p>

          <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', padding: '20px', textAlign: 'left', marginBottom: '32px', border: '1px solid #bfdbfe' }}>
            <span style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>🎁 <b>Ваш бонус закреплен!</b></span>
            <span style={{ fontSize: '14px', color: '#1e40af' }}>Набор по уходу за ПВХ-профилями или дополнительная скидка на монтаж закреплена за вашим номером телефона.</span>
          </div>

          <Link 
            href="/" 
            style={{ 
              display: 'block', 
              backgroundColor: '#2563eb', 
              color: '#fff', 
              padding: '16px 0', 
              borderRadius: '12px', 
              fontSize: '15px', 
              fontWeight: '600', 
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              transition: 'background-color 0.2s'
            }}
          >
            Вернуться на главную
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}