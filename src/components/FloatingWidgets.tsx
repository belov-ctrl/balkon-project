'use client';

import React, { useState, useEffect } from 'react';

interface FloatingWidgetsProps {
  onOpenCalc: () => void;
}

export default function FloatingWidgets({ onOpenCalc }: FloatingWidgetsProps) {
  const [isMounted, setIsMounted] = useState(false); // Флаг отложенного старта
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatStep, setChatStep] = useState(1);
  const [isChatSubmitting, setIsChatSubmitting] = useState(false);

  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [isGiftSubmitting, setIsGiftSubmitting] = useState(false);

  // УМНЫЙ РАЗГОН: Загружаем тяжелые виджеты только через 3 секунды либо при первом скролле
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const loadWidgets = () => {
      setIsMounted(true);
      window.removeEventListener('scroll', loadWidgets);
      window.removeEventListener('touchstart', loadWidgets);
    };

    // Триггер по времени
    timer = setTimeout(loadWidgets, 3000);

    // Триггеры по действию пользователя
    window.addEventListener('scroll', loadWidgets, { passive: true });
    window.addEventListener('touchstart', loadWidgets, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', loadWidgets);
      window.removeEventListener('touchstart', loadWidgets);
    };
  }, []);

  // ФУНКЦИЯ МАСКИ НОМЕРА ТЕЛЕФОНА
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.startsWith('7') || input.startsWith('8')) input = input.substring(1);
    input = input.substring(0, 10);

    let formatted = '';
    if (input.length > 0) formatted = '+7 (' + input.substring(0, 3);
    if (input.length > 3) formatted += ') ' + input.substring(3, 6);
    if (input.length > 6) formatted += '-' + input.substring(6, 8);
    if (input.length > 8) formatted += '-' + input.substring(8, 10);
    
    e.target.value = input ? formatted : '';
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChatSubmitting(true);
    const form = e.target as HTMLFormElement;
    const phoneInput = form.querySelector('input[type="tel"]') as HTMLInputElement;

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Клиент из Чата',
          phone: phoneInput.value,
          source: 'Виджет: Онлайн-чат'
        })
      });
      if (res.ok) setChatStep(2);
    } catch (error) {
      console.error(error);
    } finally {
      setIsChatSubmitting(false);
    }
  };

  const handleGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGiftSubmitting(true);
    const form = e.target as HTMLFormElement;
    const phoneInput = form.querySelector('input[type="tel"]') as HTMLInputElement;

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Ловец подарков',
          phone: phoneInput.value,
          source: 'Виджет: Скрытый подарок 🎁'
        })
      });
      if (res.ok) {
        alert('Подарок успешно забронирован за вашим номером! Наш менеджер скоро свяжется с вами.');
        setIsGiftOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGiftSubmitting(false);
    }
  };

  // Если время/скролл еще не наступили — возвращаем пустоту, не нагружая процессор мобилки
  if (!isMounted) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* ТАБ КАЛЬКУЛЯТОРА СЛЕВА С МАКСИМАЛЬНЫМ ПРИОРИТЕТОМ КЛИКА */
        .widget-calc-tab {
          position: fixed; top: 50%; left: 0; transform: translateY(-50%);
          background-color: #1e3a8a; color: #fff; padding: 20px 12px;
          border-radius: 0 14px 14px 0; font-weight: 700; font-size: 14px;
          cursor: pointer; z-index: 999999 !important; box-shadow: 4px 0 20px rgba(0,0,0,0.2);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          transition: all 0.2s ease-in-out; pointer-events: auto !important;
        }
        .widget-calc-tab:hover { background-color: #2563eb; padding-left: 16px; }
        .widget-calc-text { writing-mode: vertical-rl; transform: rotate(180deg); letter-spacing: 0.05em; }

        /* КНОПКА ПОДАРКА */
        .widget-gift-btn {
          position: fixed; bottom: 30px; left: 30px; background-color: #e11d48;
          color: #fff; padding: 14px 24px; border-radius: 50px; font-weight: 700;
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          box-shadow: 0 10px 25px rgba(225,29,72,0.4); z-index: 999998 !important;
          animation: floatGift 3s ease-in-out infinite; transition: transform 0.2s;
          pointer-events: auto !important;
        }
        .widget-gift-btn:hover { transform: translateY(-4px) scale(1.03); }

        /* КНОПКА ЧАТА */
        .widget-chat-btn {
          position: fixed; bottom: 30px; right: 30px; width: 64px; height: 64px;
          background-color: #2563eb; border-radius: 50%; display: flex;
          justify-content: center; align-items: center; cursor: pointer;
          box-shadow: 0 10px 25px rgba(37,99,235,0.4); z-index: 999998 !important;
          animation: pulseChat 2s infinite; transition: transform 0.2s;
          pointer-events: auto !important;
        }
        .widget-chat-btn:hover { transform: scale(1.08); }

        /* ОКНО ЧАТА */
        .chat-window {
          position: fixed; bottom: 110px; right: 30px; width: 340px;
          background-color: #fff; border-radius: 20px; box-shadow: 0 20px 50px rgba(15,23,42,0.15);
          overflow: hidden; z-index: 999999 !important; animation: slideUp 0.3s ease-out;
          display: flex; flex-direction: column; border: 1px solid #e2e8f0;
          pointer-events: auto !important;
        }
        .chat-header { background-color: #1e3a8a; color: #fff; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
        .chat-msg { background-color: #f1f5f9; color: #1e293b; padding: 12px 16px; border-radius: 12px 12px 12px 0; font-size: 14px; margin-bottom: 16px; line-height: 1.5; align-self: flex-start; max-width: 90%; }
        
        @media (max-width: 768px) {
          .widget-calc-tab { display: none !important; }
          .widget-gift-text { display: none !important; }
          .widget-gift-btn { padding: 14px !important; border-radius: 50% !important; left: 20px !important; bottom: 20px !important; }
          .widget-chat-btn { right: 20px !important; bottom: 20px !important; width: 56px !important; height: 56px !important; }
          .chat-window { bottom: 90px !important; right: 10px !important; left: 10px !important; width: auto !important; }
        }

        @keyframes pulseChat {
          0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.6); }
          70% { box-shadow: 0 0 0 15px rgba(37,99,235,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }
        @keyframes floatGift { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      {/* Левый таб теперь железно кликабельный */}
      <div className="widget-calc-tab" onClick={onOpenCalc} role="button">
        <span style={{ fontSize: '20px' }}>🧮</span>
        <span className="widget-calc-text">Калькулятор</span>
      </div>

      <div className="widget-gift-btn" onClick={() => setIsGiftOpen(true)} role="button" aria-label="Открыть окно с подарком">
        <span style={{ fontSize: '22px' }}>🎁</span>
        <span className="widget-gift-text">Вам подарок!</span>
      </div>

      {isGiftOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', maxWidth: '400px', width: '100%', borderRadius: '24px', padding: '36px', position: 'relative', textAlign: 'center', animation: 'slideUp 0.3s ease' }}>
            <button onClick={() => setIsGiftOpen(false)} style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', fontSize: '24px', color: '#64748b', cursor: 'pointer' }} aria-label="Закрыть окно">×</button>
            <span style={{ fontSize: '50px', display: 'block', marginBottom: '10px' }}>🎁</span>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#e11d48', marginBottom: '10px' }}>Подарок за визит!</h3>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px', lineHeight: '1.5' }}>Забронируйте <strong>дополнительную скидку 10%</strong> и набор по уходу за окнами при заказе. Оставьте номер, чтобы мы закрепили подарок за вами.</p>
            <form onSubmit={handleGiftSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="tel" 
                placeholder="+7 (999) 000-00-00" 
                aria-label="Номер телефона для бронирования подарка"
                onChange={handlePhoneChange}
                minLength={18}
                maxLength={18}
                required 
                style={{ padding: '14px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none', textAlign: 'center', backgroundColor: '#fff', color: '#0f172a', fontWeight: '600' }} 
              />
              <button type="submit" disabled={isGiftSubmitting} style={{ backgroundColor: '#e11d48', color: '#fff', border: 'none', padding: '16px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                {isGiftSubmitting ? 'Бронируем...' : 'Забрать подарок'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ИСПРАВЛЕНО: Добавлен aria-label для экранных дикторов на плавающую кнопку чата */}
      <div className="widget-chat-btn" onClick={() => setIsChatOpen(!isChatOpen)} role="button" aria-label="Открыть онлайн-консультацию с Оксаной">
        {isChatOpen ? (
          <span style={{ color: '#fff', fontSize: '28px', lineHeight: 1 }}>×</span>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.6862 20 9.43729 19.7212 8.31802 19.2155L3 21L4.84323 15.9348C3.68263 14.6548 3 13.1412 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {isChatOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#4ade80', borderRadius: '50%' }}></div>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>Менеджер Оксана</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }} aria-label="Закрыть чат">×</button>
          </div>
          
          <div style={{ padding: '20px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
            {chatStep === 1 ? (
              <div style={{ animation: 'slideUp 0.3s' }}>
                <div className="chat-msg">
                  Здравствуйте! 👋 Я на связи и готова проконсультировать вас. 
                  <br/><br/>
                  Чтобы мы могли начать диалог и не потерялись в случае закрытия сайта, пожалуйста, укажите ваш номер телефона:
                </div>
                <form onSubmit={handleChatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="tel" 
                    placeholder="+7 (999) 000-00-00" 
                    aria-label="Ваш номер телефона для связи в чате"
                    onChange={handlePhoneChange}
                    minLength={18}
                    maxLength={18}
                    required 
                    style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#fff', color: '#0f172a', fontWeight: '600' }} 
                  />
                  <button type="submit" disabled={isChatSubmitting} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    {isChatSubmitting ? 'Соединяем...' : 'Начать диалог'}
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ animation: 'slideUp 0.3s' }}>
                <div className="chat-msg">
                  Спасибо! Ваш номер сохранен. Теперь вы можете задать свой вопрос, я читаю:
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Введите сообщение..." aria-label="Текст вашего вопроса" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                  <button onClick={() => alert('Сообщение отправлено Оксане! Она ответит вам в СМС или перезвонит в течение 2-х минут.')} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', width: '44px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Отправить сообщение">
                    ➤
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}