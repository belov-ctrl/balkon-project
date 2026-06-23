'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactsMap() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // УМНАЯ ФУНКЦИЯ МАСКИ ДЛЯ РОССИЙСКИХ НОМЕРОВ ТЕЛЕФОНА
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

  return (
    <section className="contacts-section">
      
      {/* ПРАВИЛЬНЫЕ ЧИСТЫЕ CSS СТИЛИ БЕЗ ОШИБОК */}
      <style dangerouslySetInnerHTML={{ __html: `
        .contacts-section {
          position: relative;
          width: 100%;
          height: 540px;
          background-color: #fff;
          border-top: 1px solid #cbd5e1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .map-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .map-content-container {
          max-width: 1240px;
          margin: 0 auto;
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 5;
          padding: 0 20px;
          pointer-events: none; /* Пропускаем клики на карту */
        }
        .map-form-block {
          position: absolute;
          top: 50px;
          left: 20px;
          background-color: #fff;
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          text-align: left;
          pointer-events: auto; /* Возвращаем клики для формы */
        }
        .map-info-block {
          position: absolute;
          top: 70px;
          right: 40px;
          background-color: #fff;
          border-radius: 50%;
          width: 320px;
          height: 320px;
          padding: 30px;
          box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          pointer-events: auto; /* Возвращаем клики для контактов */
        }
        
        /* === МОБИЛЬНАЯ АДАПТАЦИЯ === */
        @media (max-width: 991px) {
          .contacts-section {
            height: auto;
            background-color: #f8fafc;
            overflow: visible;
          }
          .map-wrapper {
            position: relative;
            height: 350px;
            order: 3;
            border-top: 1px solid #e2e8f0;
            z-index: 1;
          }
          .map-content-container {
            height: auto;
            padding: 40px 20px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            pointer-events: auto;
            order: 1;
          }
          .map-form-block {
            position: relative;
            top: auto;
            left: auto;
            max-width: 100%;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
            order: 2;
            padding: 24px;
          }
          .map-info-block {
            position: relative;
            top: auto;
            right: auto;
            width: 100%;
            height: auto;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
            order: 1;
          }
        }
      `}} />
      
      {/* ИНТЕРАКТИВНАЯ КАРТА (С ЛЕНИВОЙ ЗАГРУЗКОЙ) */}
      <div className="map-wrapper">
        <iframe 
          src="https://yandex.ru/map-widget/v1/?text=%D0%9E%D0%BC%D1%81%D0%BA%2C%20%D1%83%D0%BB.%20%D0%93%D1%83%D1%81%D0%B0%D1%80%D0%BE%D0%B2%D0%B0%2C%20%D0%B4.%2026&z=16" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy" // Включили жесткую ленивую загрузку iframe для PageSpeed 🚀
        ></iframe>
      </div>
      
      <div className="map-content-container">
        
        {/* ФОРМА ЗАМЕРА С ИНТЕГРАЦИЕЙ В БЭКЕНД */}
        <div className="map-form-block">
          <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#1e3a8a', lineHeight: '1.3', marginBottom: '18px' }}>
            Запись на бесплатный замер для расчета итоговой стоимости
          </h3>
          
          <form 
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} 
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              const form = e.target as HTMLFormElement;
              const nameInput = form.querySelector('input[placeholder="Введите имя..."]') as HTMLInputElement;
              const phoneInput = form.querySelector('input[type="tel"]') as HTMLInputElement;

              try {
                const res = await fetch('/api/leads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: nameInput.value || 'Анонимный клиент',
                    phone: phoneInput.value,
                    source: 'Нижняя форма у карты: Заявка на бесплатный замер (Гусарова)'
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
                setIsSubmitting(false);
              }
            }}
          >
            <input type="text" placeholder="Введите имя..." style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#fff', color: '#0f172a' }} />
            <input 
              type="tel" 
              placeholder="+7 (999) 000-00-00" 
              onChange={handlePhoneChange}
              minLength={18}
              maxLength={18}
              required 
              style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none', backgroundColor: '#fff', color: '#0f172a' }} 
            />
            
            <div style={{ display: 'flex', alignItems: 'start', gap: '8px', marginTop: '4px' }}>
              <input type="checkbox" id="map_consent" required defaultChecked style={{ width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }} />
              <label htmlFor="map_consent" style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                Отправляя заявку, вы соглашаетесь на обработку персональных данных и с политикой конфиденциальности.
              </label>
            </div>

            <button type="submit" disabled={isSubmitting} className="ui-btn" style={{ backgroundColor: '#e11d48', color: '#fff', border: 'none', padding: '14px 0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
              {isSubmitting ? 'Отправка...' : 'Вызвать замерщика'}
            </button>
          </form>
        </div>

        {/* ПЛАШКА С КОНТАКТАМИ */}
        <div className="map-info-block">
          <div style={{ fontWeight: '700', fontSize: '18px', color: '#1e3a8a', letterSpacing: '-0.02em', marginBottom: '8px', lineHeight: '1.2' }}>
            БАЛКОННЫЕ РЕШЕНИЯ <span style={{ color: '#2563eb', display: 'block', fontSize: '14px', fontWeight: '800' }}>ОМСК</span>
          </div>
          
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5', margin: '8px 0 16px 0', maxWidth: '240px' }}>
            Oстекление балконов и лоджий в Омске <br />
            <strong>ул. Гусарова, д. 26</strong>
          </p>

          <a href="tel:83812280230" style={{ fontWeight: '700', color: '#0f172a', textDecoration: 'none', fontSize: '19px', marginBottom: '6px', display: 'block' }}>
            8 (3812) 28-02-30
          </a>
          
          <a href="mailto:industrieocon55@mail.ru" style={{ fontSize: '13.5px', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
            industrieocon55@mail.ru
          </a>
        </div>

      </div>
    </section>
  );
}